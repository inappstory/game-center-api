/**
 * Public API for SDK
 */
import { SdkApiCallbacks } from "./index.h";
import { createInitGame } from "./initGame";
import { initLocalData } from "../localData";
import { isAndroid, isIos, isWeb } from "../env";
import { webSource } from "./web/Source";
import { isFunction } from "../helpers/isFunction";
import { isObject } from "../helpers/isObject";
import { OpenStoryOptions } from "./openStory.h";
import { gameLaunchHandlers } from "../gameLaunchConfig";
import { asyncQueue } from "../asyncQueue";

let beforeUnmount: (() => void) | undefined;
export const createSdkApi = ({
    mounted,
    beforeUnmount: beforeUnmountCb,
    onSdkCloseGameReaderIntent,
    onPause,
    onResume,
    onBackGesture,
    onAudioFocusChange,
    filterPlaceholders,
}: SdkApiCallbacks) => {
    beforeUnmount = beforeUnmountCb;
    gameLaunchHandlers.filterPlaceholders = filterPlaceholders ?? gameLaunchHandlers.filterPlaceholders;

    createInitGame(async () => initLocalData(), mounted);

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

    window.sdkCb = (payload: string) => {
        try {
            const { id, response } = JSON.parse(payload);

            if (asyncQueue.has(id)) {
                const cb = asyncQueue.get(id);
                cb(response);
                asyncQueue.delete(id);
            }
        } catch (e) {
            console.error(e, { inputData: payload });
        }
    };

    // create bridge for web-sdk
    if (isWeb) {
        const initWebSource = (event: MessageEvent<any>) => {
            // call only for initGame msg from sdk
            // prevent override webSource.sourceWindowOrigin from game itself msg (mobile safari issue)
            webSource.sourceWindow = event.source as Window;
            webSource.sourceWindowOrigin = event.origin;

            // enable broadcast for corner case (VK WKWebView)
            if (event.origin === "null" || event.origin == null || !Boolean(event.origin)) {
                webSource.sourceWindowOrigin = "*";
            }
        };

        window.addEventListener(
            "message",
            event => {
                // if (event.origin !== "http://example.org:8080")
                //     return;
                const data = event.data;

                if (Array.isArray(data)) {
                    switch (data[0]) {
                        case "initGame":
                            {
                                initWebSource(event);
                                // TODO - SDK version (second arg)
                                isFunction(window.initGame) && window.initGame(data[1]);
                            }
                            break;
                        case "closeGameReader":
                            {
                                window.closeGameReader();
                            }
                            break;
                        case "shareComplete":
                            {
                                if (data[1]) {
                                    const parsedData = data[1];
                                    window.share_complete(parsedData.id, parsedData.isSuccess);
                                }
                            }
                            break;
                        case "cb":
                            {
                                if (data[1] && isObject(data[1])) {
                                    const params = data[1] as { cb: string; plainData: string; arguments: string };

                                    if (params["cb"] === "initGame") {
                                        initWebSource(event);
                                    }

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

export type CloseGameReaderOptions = {
    [key: string]: any;
    openUrl?: string;
    openStory?: OpenStoryOptions;
};

/**
 * API method for close Reader from game
 */
const sdkCloseGameReader = (data?: CloseGameReaderOptions) => {
    beforeUnmount && beforeUnmount();

    const devPayload = data ?? {};
    const openUrl = data?.openUrl != null ? data.openUrl : null;
    const openStory = data?.openStory != null ? data.openStory : null;

    if (isAndroid) {
        // {openUrl: null, openStory: {id: 1, slideIndex: 0}}
        const config = JSON.stringify({ openUrl, openStory });

        window.Android.gameComplete(JSON.stringify(data), JSON.stringify(devPayload), config);
    } else if (isIos) {
        // {openUrl: null, openStory: {id: 1, slideIndex: 0}}
        window.webkit.messageHandlers.gameComplete.postMessage(
            JSON.stringify({
                data: data,
                result: devPayload,
                openUrl,
                openStory,
            })
        );
    } else if (isWeb) {
        if (webSource.sourceWindow && webSource.sourceWindowOrigin) {
            webSource.sourceWindow.postMessage(["gameComplete", data, devPayload, null, openStory], webSource.sourceWindowOrigin);
        }
    }
};

export const closeGameReader = (data?: CloseGameReaderOptions) => {
    sdkCloseGameReader(data);
};

export const reloadGameReader = () => {
    // todo add sdk support definition

    if (isAndroid) {
        if (window.Android.reloadGameReader) {
            window.Android.reloadGameReader();
        }
    } else if (isIos) {
        if (window.webkit.messageHandlers.reloadGameReader) {
            window.webkit.messageHandlers.reloadGameReader.postMessage("");
        }
    } else if (isWeb) {
        if (webSource.sourceWindow && webSource.sourceWindowOrigin) {
            webSource.sourceWindow.postMessage(["reloadGameReader"], webSource.sourceWindowOrigin);
        }
    }
};
