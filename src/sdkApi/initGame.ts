import { GameLaunchConfig } from "../gameLaunchConfig.h";
import { isObject } from "../helpers/isObject";
import { gameLaunchConfig, setGameLaunchConfig } from "../gameLaunchConfig";
import { iosMh, isAndroid, isIos, isWeb } from "../env";
import { webSource } from "./web/Source";
import { createNonce } from "../createNonce";

declare global {
    interface Window {
        gameReader: GameReaderInit;
        initGame: (config: GameLaunchConfig) => Promise<void>;
        closeGameReader: () => true;
        pauseUI: () => void;
        resumeUI: () => void;
        gameReaderGestureBack: () => void;
        handleAudioFocusChange: (focusChange: number) => void;
        __debug?: boolean;
        _log: (text: string) => void;
        _sendErrorLog: (payload: Record<string, any>) => void;
        gameLoadingInfo: {
            loaded: boolean;
            state: string;
            description: string;
            error: string;
        };
        gameLoadFailed: typeof gameLoadFailedSdkCallback;
    }
}

window.gameLoadingInfo = {
    loaded: false,
    state: "before gameReader API creation",
    description: "",
    error: "",
};

type GameReaderInit = {
    _e: Array<() => void>;
    ready: (cb: () => void) => void;
};
const gameReader: GameReaderInit = (function () {
    const self = (window.gameReader || {}) as GameReaderInit;
    self._e = self._e || [];
    if (self._e) {
        for (let i = 0; i < self._e.length; i++) {
            setTimeout(
                (function (cb: () => void, i: number) {
                    return function () {
                        try {
                            window.gameLoadingInfo.state = "before call gameReaderInit queue";
                            window.gameLoadingInfo.description = "index: " + i;
                            cb();
                            window.gameLoadingInfo.state = "after call gameReaderInit queue";
                            window.gameLoadingInfo.description = "index: " + i;
                        } catch (e) {
                            window._sendErrorLog &&
                                window._sendErrorLog({ src: "gameReaderInit queue", message: (e as Error).message, stack: (e as Error).stack });
                            console.error(e);
                        }
                    };
                })(self._e[i], i)
            );
        }
    }
    self.ready = function (cb) {
        setTimeout(function () {
            try {
                window.gameLoadingInfo.state = "before call gameReaderInit ready";
                window.gameLoadingInfo.description = "";
                cb();
                window.gameLoadingInfo.state = "after call gameReaderInit ready";
                window.gameLoadingInfo.description = "";
            } catch (e) {
                window._sendErrorLog && window._sendErrorLog({ src: "gameReaderInit ready", message: (e as Error).message, stack: (e as Error).stack });
                console.error(e);
            }
        });
    };
    return self;
})();

window.gameReader = gameReader;

export const createInitGame = (initLocalData: () => Promise<void>, cb?: () => void) => {
    window.initGame = async function (config: GameLaunchConfig) {
        try {
            window.gameLoadingInfo.state = "before call initGame";
            window.gameLoadingInfo.description = JSON.stringify(config);
            if (!isObject(config)) {
                console.error("Invalid gameConfig");
                return;
            }

            // dto -> model
            setGameLaunchConfig(config);

            if (gameLaunchConfig.verbose) {
                // @ts-ignore
                window.__config = config;
            }

            if (gameLaunchConfig?.clientConfig?.nonce) {
                createNonce(gameLaunchConfig?.clientConfig?.nonce);
            }

            await initLocalData();

            cb && cb();

            window.gameLoadingInfo.state = "after call initGame";
            window.gameLoadingInfo.description = JSON.stringify(config);
        } catch (e) {
            window._sendErrorLog && window._sendErrorLog({ src: "initGame", message: (e as Error).message, stack: (e as Error).stack });
            console.error(e);
        }
    };
};

type GameLoadedSdkConfig = Partial<{
    showClose: boolean; // display native close btn or not
    backGesture: boolean; // catch native navigator back action (Android only)
}>;

/**
 * API method for remove loader screen from Reader
 */
export const gameLoadedSdkCallback = (config?: Partial<GameLoadedSdkConfig>) => {
    window.gameLoadingInfo.state = "before call gameLoadedSdkCallback";
    window.gameLoadingInfo.description = "";
    try {
        let showClose = config?.showClose;
        if (showClose == null) {
            showClose = false;
        }
        let backGesture = config?.backGesture;
        if (backGesture == null) {
            backGesture = true;
        }
        if (isAndroid) {
            if (window.Android.gameLoaded !== undefined) {
                window.Android.gameLoaded(JSON.stringify({ showClose, backGesture }));
            }
        } else if (isIos) {
            if (iosMh.gameLoaded !== undefined) {
                iosMh.gameLoaded.postMessage(JSON.stringify({ showClose, backGesture: false }));
            }
        } else if (isWeb) {
            if (webSource.sourceWindow && webSource.sourceWindowOrigin) {
                webSource.sourceWindow.postMessage(
                    [
                        "gameLoaded",
                        JSON.stringify({
                            showClose,
                            backGesture,
                        }),
                    ],
                    webSource.sourceWindowOrigin
                );
            }
        }
        window.gameLoadingInfo.state = "after call gameLoadedSdkCallback";
        window.gameLoadingInfo.description = "";
        window.gameLoadingInfo.loaded = true;
    } catch (e) {
        window._sendErrorLog && window._sendErrorLog({ src: "gameLoadedSdkCallback", message: (e as Error).message, stack: (e as Error).stack });
        console.error(e);
    }
};

window.gameLoadingInfo = {
    loaded: false,
    state: "gameReader API created",
    description: "",
    error: "",
};

export const gameLoadFailedSdkCallback = (reason: string, canTryReload: boolean) => {
    if (!window.gameLoadingInfo.loaded) {
        window.gameLoadingInfo.state = "before call gameLoadFailedSdkCallback";
        window.gameLoadingInfo.description = reason;
        if (isAndroid) {
            if (window.Android.gameLoadFailed) {
                window.Android.gameLoadFailed(reason, canTryReload);
            }
        } else if (isIos) {
            if (iosMh.gameLoadFailed) {
                iosMh.gameLoadFailed.postMessage(JSON.stringify({ reason, canTryReload }));
            }
        } else if (isWeb) {
            if (webSource.sourceWindow && webSource.sourceWindowOrigin) {
                webSource.sourceWindow.postMessage(["gameLoadFailed", reason, canTryReload], webSource.sourceWindowOrigin);
            }
        }
    }
};

window.gameLoadFailed = gameLoadFailedSdkCallback;
