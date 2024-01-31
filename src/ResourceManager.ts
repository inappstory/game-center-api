import {fetchLocalFile} from "./sdkApi/fetchLocalFile";

export interface ResourceInterface {
    // set cache uri to object internal variable
    setCacheUri(uri: string): void;

    getCacheUri(): string;

    getOriginUri(): string;

    unsetCacheUri(): void;

    key: string;
}


export class ResourceManager {
    private constructor(private readonly srcInterfaces: Array<Iterable<ResourceInterface>>) {
    }

    private static instance: ResourceManager;

    public static createInstance(srcInterfaces: Array<Iterable<ResourceInterface>>) {
        if (ResourceManager.instance == null) {
            ResourceManager.instance = new ResourceManager(srcInterfaces);
        }
    }

    public static getInstance() {
        if (ResourceManager.instance == null) {
            ResourceManager.createInstance([]);
        }
        return ResourceManager.instance;
    }

    public preloadAllResources() {
        const promises = [];
        for (let key in this.srcInterfaces) {
            for (let resource of this.srcInterfaces[key]) {
                promises.push(((resource) => {
                    return new Promise<void>(async (resolve, reject) => {
                        const src = resource.getOriginUri();
                        if (!src) {
                            resolve();
                        } else {
                            try {
                                const response = await fetchLocalFile(src);
                                if (response != null) {
                                    const objectUrl = URL.createObjectURL(await response.blob());
                                    resource.setCacheUri(objectUrl);
                                    resolve();
                                } else {
                                    reject( `Resource fetching error for ${resource.getOriginUri()}: ${resource.key}`);
                                }
                            } catch (err) {
                                reject(`Resource fetching error for ${resource.getOriginUri()}: ${resource.key}`);
                            }
                        }
                    });
                })(resource));
            }
        }

        return Promise.all(promises);
    }

    public revokeCache(): void {
        for (let key in this.srcInterfaces) {
            for (let resource of this.srcInterfaces[key]) {
                if (resource.getCacheUri()) {
                    URL.revokeObjectURL(resource.getCacheUri());
                    resource.unsetCacheUri();
                }
            }
        }
    }
}
