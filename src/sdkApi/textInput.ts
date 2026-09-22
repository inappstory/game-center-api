import { iosMh, isAndroid, isIos, isWeb } from "../env";
import { v4 as uuidV4 } from "uuid";
import { webSource } from "./web/Source";
import { gameLaunchConfig } from "../gameLaunchConfig";
import { asyncQueue } from "../asyncQueue";

export const showTextInput = async (config: { title: string; input: { placeholder: string; type: "" | "email" | "tel" }; button: string }): Promise<string> => {
    const id = uuidV4();

    const result = new Promise<string>((resolve, reject) => {
        asyncQueue.set(id, (response: string) => resolve(response));
    });

    if (isIos && iosMh.showTextInput !== undefined) {
        iosMh.showTextInput.postMessage(
            JSON.stringify({
                id,
                cb: "sdkCb",
                config,
            })
        );
        return result;
    } else if (isAndroid && window.Android.showTextInput !== undefined) {
        window.Android.showTextInput(JSON.stringify({ id, cb: "sdkCb", config }));
        return result;
    } else if (webSource.sourceWindow && webSource.sourceWindowOrigin && gameLaunchConfig.clientConfig?.sdkFeatures?.showTextInput === true) {
        webSource.sourceWindow.postMessage(["showTextInput", JSON.stringify({ id, cb: "sdkCb", config })], webSource.sourceWindowOrigin);
        return result;
    } else {
        return Promise.reject("Not implemented");
    }
};

export const hasTextInputApi = () => {
    let hasSupport = false;
    if (isAndroid && window.Android.showTextInput !== undefined) {
        hasSupport = true;
    }
    if (isIos && iosMh.showTextInput !== undefined) {
        hasSupport = true;
    }
    if (isWeb) {
        if (webSource.sourceWindow && webSource.sourceWindowOrigin && gameLaunchConfig.clientConfig?.sdkFeatures?.showTextInput === true) {
            hasSupport = true;
        }
    }

    return hasSupport;
};
