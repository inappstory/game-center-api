/**
 * Public API for SDK
 */
import {SdkApiCallbacks} from "./index.h";
import {createInitGame} from "./initGame";
import {initLocalData} from "../localData";
import {isAndroid, isIos, isWeb} from "../env";
import {webSource} from "./web/Source";
import {isFunction} from "../helpers/isFunction";
import {isObject} from "../helpers/isObject";


let beforeUnmount: (() => void) | undefined;
export const createSdkApi = ({
                                 mounted,
                                 beforeUnmount: beforeUnmountCb,
                                 onSdkCloseGameReaderIntent,
                                 onPause,
                                 onResume,
                                 onBackGesture,
                                 onAudioFocusChange
                             }: Partial<SdkApiCallbacks>) => {

    beforeUnmount = beforeUnmountCb;

    createInitGame( async () => initLocalData(), mounted);

    window.closeGameReader = () => {

        if (onSdkCloseGameReaderIntent) {
            onSdkCloseGameReaderIntent();
        } else {
            // close important
            sdkCloseGameReader();
        }

        // indicate for sdk
        return true;
    };

    window.pauseUI = function () {
        onPause && onPause();
    };

    window.resumeUI = function () {
        onResume && onResume();
    };

    window.gameReaderGestureBack = function () {
        onBackGesture && onBackGesture();

        // indicate for sdk
        return true;
    };

    window.handleAudioFocusChange = function (focusChange: number) {
        onAudioFocusChange && onAudioFocusChange(focusChange);
    };

    // create bridge for web-sdk
    if (isWeb) {
        window.addEventListener(
            "message",
            event => {
                // if (event.origin !== "http://example.org:8080")
                //     return;
                const data = event.data;
                webSource.sourceWindow = event.source as Window;
                webSource.sourceWindowOrigin = event.origin;

                // enable broadcast for corner case (VK WKWebView)
                if (event.origin === "null" || event.origin == null || !Boolean(event.origin)) {
                    webSource.sourceWindowOrigin = "*";
                }

                if (Array.isArray(data)) {
                    switch (data[0]) {
                        case "initGame": {
                            // TODO - SDK version (second arg)
                            isFunction(window.initGame) && window.initGame(data[1]);
                        }
                            break;
                        case "closeGameReader": {
                            window.closeGameReader();
                        }
                            break;
                        case "shareComplete": {
                            if (data[1]) {
                                const parsedData = data[1];
                                window.share_complete(parsedData.id, parsedData.isSuccess);
                            }
                        }
                            break;
                        case "cb": {
                            if (data[1] && isObject(data[1])) {
                                const params = data[1] as { cb: string; plainData: string; arguments: string };
                                // sendApi cb
                                if (params["cb"] && params["plainData"]) {
                                    // @ts-ignore
                                    window[params["cb"]](params["plainData"]);
                                } else if (params["cb"] && params["arguments"]) {
                                    try {
                                        const args = JSON.parse(params["arguments"]);
                                        if (Array.isArray(args)) {
                                            // @ts-ignore
                                            window[params["cb"]].apply(this, args);
                                        }
                                    } catch (e) {
                                        console.error(e);
                                    }
                                }
                            }
                        }
                            break;
                    }
                }
            },
            false
        );
    }
};


/**
 * API method for close Reader from game
 */
const sdkCloseGameReader = (data?: Record<string, any>) => {

    beforeUnmount && beforeUnmount();

    const devPayload = data ?? {};
    const openUrl = null;
    const openStory = data?.openStory != null ? data.openStory : null;

    if (isAndroid) {
        // {openUrl: null, openStory: {id: 1, slideIndex: 0}}
        const config = JSON.stringify({openUrl, openStory});

        window.Android.gameComplete(JSON.stringify(data), JSON.stringify(devPayload), config);


    } else if (isIos) {
        // {openUrl: null, openStory: {id: 1, slideIndex: 0}}
        window.webkit.messageHandlers.gameComplete.postMessage(JSON.stringify({
            data: data,
            result: devPayload,
            openUrl,
            openStory
        }));
    } else if (isWeb) {
        if (webSource.sourceWindow && webSource.sourceWindowOrigin) {
            webSource.sourceWindow.postMessage(["gameComplete", data, devPayload, null], webSource.sourceWindowOrigin);
        }
    }
};

export const closeGameReader = () => {
    sdkCloseGameReader();
};
