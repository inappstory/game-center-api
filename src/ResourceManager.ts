import {fetchLocalFile} from "./sdkApi/fetchLocalFile";

export interface ResourceInterface {
    // set cache uri to object internal variable
    setCacheUri(uri: string): void;

    getCacheUri(): string;

    getOriginUri(): string;

    unsetCacheUri(): void;

    key: string;
}


let instance: ResourceManager;

export class ResourceManager {
    private constructor(private readonly srcInterfaces: Array<Iterable<ResourceInterface>>) {
    }

    public static createInstance(srcInterfaces: Array<Iterable<ResourceInterface>>) {
        if (instance == null) {
            instance = new ResourceManager(srcInterfaces);
        }
    }

    public static getInstance() {
        if (instance == null) {
            ResourceManager.createInstance([]);
        }
        return instance;
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
                                    console.warn( `Resource fetching error for ${resource.getOriginUri()}: ${resource.key}`);
                                    resolve();
                                }
                            } catch (err) {
                                console.warn(`Resource fetching error for ${resource.getOriginUri()}: ${resource.key}`, err);
                                resolve();
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
