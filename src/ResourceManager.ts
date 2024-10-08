import { fetchLocalFile } from "./sdkApi/fetchLocalFile";
import { type ResourceList } from "./gameResources";

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

        for (let resUri in this.cacheTree) {
            const { resourceForFetch, relatedResources } = this.cacheTree[resUri];

            const promise = ((resourceForFetch, relatedResources) => {
                return new Promise<void>(async (resolve, reject) => {
                    const resouceKeys = relatedResources.map(resource => resource.key);
                    const uri = resourceForFetch.getUri();
                    const originUri = resourceForFetch.getOriginUri();

                    try {
                        const objectUrl = await this.cacheResource({ uri, originUri, resouceKeys });

                        if (objectUrl === originUri) {
                            resolve();

                            return;
                        }

                        for (const resource of relatedResources) {
                            resource.setCacheUri(objectUrl);
                        }

                        resolve();
                    } catch (e) {
                        reject(`Can't load resource for [${resouceKeys.join(", ")}]`);
                    }
                });
            })(resourceForFetch, relatedResources);

            promises.push(promise);
        }

        await Promise.all(promises);

        for (const resList of this.resLists) resList["onCacheDone"]();
    }

    public async cacheResource({
        uri,
        originUri = uri,
        resouceKeys = ["outerResource"],
    }: {
        uri: string;
        originUri?: string;
        resouceKeys?: string[];
    }): Promise<string> {
        let objectUrl = await this.createObjectUrlByUri(uri, resouceKeys);

        if (objectUrl === null && uri !== originUri) objectUrl = await this.createObjectUrlByUri(originUri, resouceKeys);

        if (objectUrl !== null) return objectUrl;

        return new Promise((resolve, reject) => {
            const image = new Image();

            image.onload = () => resolve(originUri);
            image.onerror = () => reject();

            image.src = originUri;
        });
    }
    private async createObjectUrlByUri(uri: string, resouceKeys: string[]): Promise<null | string> {
        if (!uri) {
            throw `Resource uri for [${resouceKeys.join(", ")}] can't be empty string`;
        }

        try {
            const response = await fetchLocalFile(uri);

            if (response != null && response.ok) {
                return URL.createObjectURL(await response.blob());
            } else {
                throw "";
            }
        } catch (err) {
            console.warn(`Error to fetch ${uri} for related images [${resouceKeys.join(", ")}]`, err);

            return null;
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
