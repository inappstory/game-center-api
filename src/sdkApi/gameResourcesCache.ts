import { v4 as uuidV4 } from "uuid";
import { SDKGameResource } from "./gameResourcesCache.h";
import { iosMh, isAndroid, isIos } from "../env";
import { asyncQueue } from "../asyncQueue";

export const addGameResourceToSDKCache = (resource: SDKGameResource) => {
    const id = uuidV4();

    const result = new Promise<void>((resolve, reject) => {
        const sdkCb = (data: { result: boolean; reason?: string }) => {
            if (data.result) {
                resolve();
            } else {
                reject(data.reason);
            }
        };
        asyncQueue.set(id, sdkCb);
    });

    if (isIos && iosMh.addToCache != null) {
        iosMh.addToCache.postMessage(
            JSON.stringify({
                id,
                cb: "sdkCb",
                resource,
            })
        );
        return result;
    } else if (isAndroid && window.Android.addToCache != null) {
        window.Android.addToCache(JSON.stringify({ id, cb: "sdkCb", resource }));
        return result;
    } else {
        throw new Error("Not implemented");
    }
};

export const hasAddToSDKCacheApi = () => {
    let hasSupport = false;
    if (isAndroid && window.Android.addToCache != null) {
        hasSupport = true;
    }
    if (isIos && iosMh.addToCache != null) {
        hasSupport = true;
    }
    // WEB SDK is without local disk cache

    return hasSupport;
};
