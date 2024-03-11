import {isAndroid, isIos, isWeb} from "../env";
import {webSource} from "./web/Source";

export const eventGame = (payload: Record<string, any>) => {
    const name = "eventGame";
    if (isAndroid) {
        if (window.Android.event) {
            window.Android.event(name, JSON.stringify(payload));
        }
    } else if (isIos) {
        if (window.webkit.messageHandlers.event) {
            window.webkit.messageHandlers.event.postMessage(JSON.stringify({name, payload}));
        }
    } else if (isWeb) {
        if (webSource.sourceWindow && webSource.sourceWindowOrigin) {
            webSource.sourceWindow.postMessage(["event", name, payload], webSource.sourceWindowOrigin);
        }
    }
}
