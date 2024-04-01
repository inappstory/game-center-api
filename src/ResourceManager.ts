import { fetchLocalFile } from "./sdkApi/fetchLocalFile";
import { Resource } from "./gameResources";

export interface ResourceInterface {
    // set cache uri to object internal variable
    setCacheUri(uri: string): void;

    getCacheUri(): string;

    getOriginUri(): string;

    // for case when resource at getOriginUri is unavailable (Android SDK before 1.18.0)
    getOriginFallbackUri(): string;

    unsetCacheUri(): void;

    key: string;
}

let instance: ResourceManager;

export class ResourceManager {
    private constructor(private readonly srcInterfaces: Array<Resource>) {}

    public static createInstance(srcInterfaces: Array<Resource>) {
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
        const promises: Array<Promise<void>> = [];
        for (let key in this.srcInterfaces) {
            const srcInterfacePromises: Array<Promise<void>> = [];
            for (let resource of this.srcInterfaces[key]) {
                const promise = (resource => {
                    return new Promise<void>(async (resolve, reject) => {
                        let objectUrl = await this.createObjectUrlByUri(resource.key, resource.getOriginUri());
                        if (!objectUrl) {
                            objectUrl = await this.createObjectUrlByUri(resource.key, resource.getOriginFallbackUri());
                        }
                        if (objectUrl) {
                            resource.setCacheUri(objectUrl);
                            resolve();
                        } else {
                            resolve();
                        }
                    });
                })(resource);
                srcInterfacePromises.push(promise);
                promises.push(promise);
            }
            ((srcInterface: Resource) =>
                Promise.all(srcInterfacePromises).then(() => {
                    if (srcInterface["_onPreloadDoneCb"]) {
                        srcInterface["_onPreloadDoneCb"]();
                    }
                }))(this.srcInterfaces[key]);
        }

        return Promise.all(promises);
    }

    private async createObjectUrlByUri(key: string, src: string): Promise<void | string> {
        if (!src) {
            return;
        }
        try {
            const response = await fetchLocalFile(src);
            if (response != null) {
                return URL.createObjectURL(await response.blob());
            } else {
                console.warn(`Resource fetching error for ${src}: ${key}`);
                return;
            }
        } catch (err) {
            console.warn(`Resource fetching error for ${src}: ${key}`, err);
            return;
        }
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
