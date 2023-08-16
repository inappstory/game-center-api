import {v4 as uuidV4} from "uuid";
import {asyncQueue} from "../asyncQueue";
import {iosMh, isAndroid, isIos, isWeb} from "../env";
import {webSource} from "./web/Source";

export type ShareData = Partial<{
    title: string | null;
    text: string | null;
    url: string | null;
    files:
        Array<{
            file: string;
            name: string;
            type: string;
        } | null
        >;
}>;

declare global {
    interface Window {
        share_complete: (requestId: string, isSuccess: boolean) => void;
    }
}

export const share = async (config: ShareData): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) => {

        const id = uuidV4();

        const handler = () => {
            if (document.visibilityState === "visible") {
                resolve(true);

                if (asyncQueue.has(id)) {
                    asyncQueue.delete(id);
                }
            }
        };

        if (isAndroid) {
            if ("share" in window.Android) {
                window.Android.share(id, JSON.stringify(config));
            }
        } else if (isIos) {
            if (iosMh.share && iosMh.share.postMessage) {
                iosMh.share.postMessage(JSON.stringify({id: id, config: config}));
            }
        } else if (isWeb) {
            if (config.files && Array.isArray(config.files) && config.files.length > 0) {
                if (webSource.sourceWindow && webSource.sourceWindowOrigin) {
                    webSource.sourceWindow.postMessage(["share", id, config], webSource.sourceWindowOrigin);
                }
            } else {
                if (webSource.sourceWindow && webSource.sourceWindowOrigin) {
                    webSource.sourceWindow.postMessage(["share", id, config], webSource.sourceWindowOrigin);
                }
            }
        }


        asyncQueue.set(id, (plainData: any) => {
            resolve(plainData);
        });
    });
};

window.share_complete = function (requestId: string, isSuccess: boolean) {
    try {
        if (asyncQueue.has(requestId)) {
            const cb = asyncQueue.get(requestId);
            cb(isSuccess);
            asyncQueue.delete(requestId);
        }
    } catch (e) {
        console.error(e, {inputData: {requestId, isSuccess}});
    }
};
