import { iosMh, isAndroid, isIos, isWeb } from "../env";
import { webSource } from "./web/Source";
import { gameLaunchConfig } from "../gameLaunchConfig";
import { Clipboard } from "../helpers/clipboard";

export const writeTextToClipboard = (textValue: string): void => {
    const data = { type: "text", textValue };
    if (isAndroid) {
        if (window.Android.writeToClipboard !== undefined) {
            window.Android.writeToClipboard(JSON.stringify(data));
        } else {
            // fallback via WebView old api
            Clipboard.copy(textValue);
        }
    } else if (isIos) {
        if (iosMh.writeToClipboard !== undefined) {
            iosMh.writeToClipboard.postMessage(JSON.stringify(data));
        } else {
            // fallback via WebView old api
            Clipboard.copy(textValue);
        }
    } else if (isWeb) {
        if (webSource.sourceWindow && webSource.sourceWindowOrigin && gameLaunchConfig.clientConfig?.sdkFeatures?.writeToClipboard === true) {
            webSource.sourceWindow.postMessage(["writeToClipboard", JSON.stringify(data)], webSource.sourceWindowOrigin);
        } else {
            // fallback via WebView old api
            Clipboard.copy(textValue);
        }
    }
};
