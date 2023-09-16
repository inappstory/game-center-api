import {iosMh, isAndroid, isIos, isWeb} from "../env";
import {webSource} from "./web/Source";
import {OpenUrlOptions} from "./openUrl.h";
import {closeGameReader as sdkCloseGameReader} from './index';

export const openUrl = ({url, closeGameReader}: OpenUrlOptions) => {
    if (isAndroid) {
        if (window.Android.openUrl !== undefined) {
            window.Android.openUrl(JSON.stringify({url}));
        }
    } else if (isIos) {
        if (iosMh.openUrl !== undefined) {
            iosMh.openUrl.postMessage(JSON.stringify({url}));
        }
    } else if (isWeb) {
        if (webSource.sourceWindow && webSource.sourceWindowOrigin) {
            webSource.sourceWindow.postMessage(
                ["openUrl", JSON.stringify({url})],
                webSource.sourceWindowOrigin
            );
        }
    }

    if (closeGameReader) {
        sdkCloseGameReader();
    }
};
