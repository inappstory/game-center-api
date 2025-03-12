import { fetchLocalFile } from "./sdkApi/fetchLocalFile";
import { type ResourceList } from "./gameResources";
import { logError } from "./eventLogger";

export interface ResourceInterface {
    // set cache uri to object internal variable
    setCacheUri(uri: string): void;

    getCacheUri(): string;

    getUri(): string;

    // for case when resource at getOriginUri is unavailable (Android SDK before 1.18.0)
    getOriginUri(): string;

    unsetCacheUri(): void;

    getOrderOfFetch(): number;

    key: string;
}

let instance: ResourceManager;

type CacheTree = Record<
    string,
    {
        resourceForFetch: ResourceInterface;
        relatedResources: ResourceInterface[];
    }
>;

export class ResourceManager {
    private cacheTree: CacheTree = {};

    private constructor(private readonly resLists: Array<ResourceList>) {}

    public static createInstance(resLists: Array<ResourceList>) {
        if (instance == null) {
            instance = new ResourceManager(resLists);
        }
    }

    public static getInstance() {
        if (instance == null) {
            ResourceManager.createInstance([]);
        }
        return instance;
    }

    private addResourceToCacheTree = (resource: ResourceInterface) => {
        const originUri = resource.getOriginUri();

        const branch = (this.cacheTree[originUri] = this.cacheTree[originUri] ?? {
            resourceForFetch: resource,
            relatedResources: [],
        });

        branch.relatedResources.push(resource);

        if (resource.getOrderOfFetch() > branch.resourceForFetch.getOrderOfFetch()) branch.resourceForFetch = resource;
    };
    private createCacheTree() {
        for (let srcInterfaceKey in this.resLists) {
            for (let resource of this.resLists[srcInterfaceKey]) {
                this.addResourceToCacheTree(resource);
            }
        }
    }
    public async cacheAllResources() {
        this.createCacheTree();

        const promises: Array<Promise<void>> = [];

        let hasInvalidResource = false;

        for (let resUri in this.cacheTree) {
            const { resourceForFetch, relatedResources } = this.cacheTree[resUri];

            const promise = ((resourceForFetch, relatedResources) => {
                return new Promise<void>(async (resolve, reject) => {
                    const resourceKeys = relatedResources.map(resource => resource.key);
                    const uri = resourceForFetch.getUri();
                    const originUri = resourceForFetch.getOriginUri();

                    try {
                        const objectUrl = await this.cacheResource({
                            uri,
                            originUri,
                            resourceKeys,
                        });

                        if (objectUrl === originUri) {
                            resolve();

                            return;
                        }

                        for (const resource of relatedResources) {
                            resource.setCacheUri(objectUrl);
                        }

                        resolve();
                    } catch (e) {
                        if (hasInvalidResource) {
                            return;
                        }

                        hasInvalidResource = true;

                        logError(e);

                        reject(`Can't load resource for [${resourceKeys.join(", ")}]`);
                    }
                });
            })(resourceForFetch, relatedResources);

            promises.push(promise);
        }

        try {
            await Promise.all(promises);
        } catch (e) {
            const error = new Error("Failed to execute cacheAllResources", { cause: e });

            logError(error);

            throw error;
        }

        for (const resList of this.resLists) {
            resList["onCacheDone"]();
        }
    }

    public async cacheResource({
        uri,
        originUri = uri,
        resourceKeys = ["outerResource"],
    }: {
        uri: string;
        originUri?: string;
        resourceKeys?: string[];
    }): Promise<string> {
        let objectUrl: string | { failMessage: string } = { failMessage: "" };

        objectUrl = await this.createObjectUrlByUri(uri, resourceKeys);

        if (typeof objectUrl !== "string" && uri !== originUri) {
            logError(`Warning: ${objectUrl.failMessage}`, { uri });

            objectUrl = await this.createObjectUrlByUri(originUri, resourceKeys);
        }

        if (typeof objectUrl === "string") {
            return objectUrl;
        }

        logError(`Warning: ${objectUrl.failMessage}`, { originUri });

        return new Promise((resolve, reject) => {
            const image = new Image();

            image.onload = () => {
                resolve(originUri);
            };
            image.onerror = (event, source, lineno, colno, error) => {
                reject(
                    new Error(`Unable to load ${originUri} via Image object`, { cause: new Error(`Fetch info: ${objectUrl.failMessage}`, { cause: error }) })
                );
            };

            image.src = originUri;
        });
    }
    private async createObjectUrlByUri(uri: string, resourceKeys: string[]): Promise<{ failMessage: string } | string> {
        try {
            if (!uri) {
                throw `Resource uri must be a valid string`;
            }

            const response = await fetchLocalFile(uri);

            if (response != null && response.ok) {
                let blob: Blob = null!;

                try {
                    blob = await response.blob();
                } catch (e) {
                    throw e;
                }

                return URL.createObjectURL(blob);
            } else {
                if (response != null) {
                    let responseText = "unknown";

                    try {
                        responseText = await response.text();
                    } catch (e) {}

                    throw `Response status: ${response.status}, response text: ${responseText}`;
                } else {
                    throw "Response is undefined";
                }
            }
        } catch (e) {
            let errorInfo = "unknown";

            if (typeof e === "string") {
                errorInfo = e;
            } else if (e && typeof e === "object" && "message" in e && typeof e.message === "string") {
                errorInfo = e.message;
            }

            return { failMessage: `Unable to fetch ${uri ? uri : "empty uri"} for related images [${resourceKeys.join(", ")}], info: ${errorInfo}` };
        }
    }
    public revokeCache(): void {
        for (let resUri in this.cacheTree) {
            const { resourceForFetch, relatedResources } = this.cacheTree[resUri];

            URL.revokeObjectURL(resourceForFetch.getCacheUri());

            relatedResources.forEach(resource => resource.unsetCacheUri());
        }

        this.cacheTree = {};
    }
}
