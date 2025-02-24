import { GameLaunchConfig } from "../gameLaunchConfig.h";
import { isObject } from "../helpers/isObject";
import { gameLaunchConfig, setGameLaunchConfig } from "../gameLaunchConfig";
import { getSemverSdkVersion, iosMh, isAndroid, isIos, isWeb } from "../env";
import { webSource } from "./web/Source";
import { createNonce } from "../createNonce";
import { logError } from "../eventLogger";

const semver = require("semver");

declare global {
    interface Window {
        gameReader: GameReaderInit;
        initGame: (config: GameLaunchConfig) => Promise<void>;
        closeGameReader: () => true;
        pauseUI: () => void;
        resumeUI: () => void;
        gameReaderGestureBack: () => void;
        handleAudioFocusChange: (focusChange: number) => void;
        sdkCb: (payload: string) => void;
        __debug?: boolean;
        _log: (text: string) => void;
        _sendErrorLog: (payload: Record<string, any>) => void;
        gameLoadingInfo: {
            sourceWindow?: Window | null;
            sourceWindowOrigin?: string | null;
            loadStarted: boolean;
            loaded: boolean;
            state: string;
            description: string;
            error: string;
            gameLaunchRawConfig?: GameLaunchConfig;
        };
        gameLoadFailed: typeof gameLoadFailedSdkCallback;
        gameShouldForeground: () => void;
    }
}

const _gameLoadingInfo = {
    loadStarted: false,
    loaded: false,
    state: "before gameReader API creation",
    description: "",
    error: "",
    gameLaunchRawConfig: undefined,
};
if (window.gameLoadingInfo != null) {
    window.gameLoadingInfo = { ...window.gameLoadingInfo, ..._gameLoadingInfo };
} else {
    window.gameLoadingInfo = _gameLoadingInfo;
}

type GameReaderInit = {
    _e: Array<() => void>;
    ready: (cb: () => void) => void;
};
const gameReader: GameReaderInit = (function () {
    const self = (window.gameReader || {}) as GameReaderInit;
    self._e = self._e || [];
    if (self._e) {
        for (let i = 0; i < self._e.length; ++i) {
            setTimeout(
                (function (cb: () => void, i: number): () => void {
                    return function () {
                        try {
                            window.gameLoadingInfo.state = "before call gameReaderInit queue";
                            window.gameLoadingInfo.description = "index: " + i;
                            cb();
                            window.gameLoadingInfo.state = "after call gameReaderInit queue";
                            window.gameLoadingInfo.description = "index: " + i;
                        } catch (e) {
                            logError(e, { src: "gameReaderInit queue" });
                        }
                    };
                })(self._e[i], i)
            );
        }
    }
    if (window.Android && window.sessionStorage != null) {
        try {
            /**
             * _initQueue in session storage
             * it is fallback for case when initCode runs before window changed from _blank to game associated window
             */
            const _initQueue = JSON.parse(window.sessionStorage.getItem("_initQueue") || "[]") as Array<string>;
            if (Array.isArray(_initQueue)) {
                for (let i = 0; i < _initQueue.length; ++i) {
                    setTimeout(
                        (function (cb: string, i: number): () => void {
                            return function () {
                                try {
                                    window.gameLoadingInfo.state = "before call gameReaderInit sessionStorage queue";
                                    window.gameLoadingInfo.description = "index: " + i;
                                    eval(cb);
                                    window.gameLoadingInfo.state = "after call gameReaderInit sessionStorage queue";
                                    window.gameLoadingInfo.description = "index: " + i;
                                } catch (e) {
                                    logError(e, { src: "gameReaderInit sessionStorage queue" });
                                }
                            };
                        })(_initQueue[i], i)
                    );
                }
            }
            window.sessionStorage.removeItem("_initQueue");
        } catch (e) {
            logError(e);
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
                logError(e, { src: "gameReaderInit ready" });
            }
        });
    };
    return self;
})();

window.gameReader = gameReader;

export const createInitGame = (initLocalData: () => Promise<void>, mounted = () => {}) => {
    window.initGame = async function (config: GameLaunchConfig) {
        try {
            // prevent call window.gameLoadFailed from fallback 30s timer (if js bundle parsed and ready)
            window.gameLoadingInfo.loadStarted = true;
            window.gameLoadingInfo.state = "before call initGame";
            window.gameLoadingInfo.gameLaunchRawConfig = config;
            window.gameLoadingInfo.description = JSON.stringify(config);
            if (!isObject(config)) {
                logError(new Error("Invalid gameConfig"));
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

            if (gameLaunchConfig?.clientConfig?.dir) {
                // for web-sdk - set dir attribute from clientConfig
                // bcz web-sdk cannot access to document.documentElement inside game iFrame
                window.document.documentElement.dir = gameLaunchConfig?.clientConfig?.dir;
            }

            try {
                await initLocalData();
            } catch (e) {
                logError(e);
                throw e;
            }

            mounted();

            window.gameLoadingInfo.state = "after call initGame";
            window.gameLoadingInfo.description = JSON.stringify(config);
        } catch (e) {
            logError(e);
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
export const gameLoadedSdkCallback = (): void => {
    if (isSdkSupportGameShouldForegroundCallback()) {
        gameLoadedSdkCallbackInternal();
    } else {
        /** Old sdk - call shouldForeground, emulate new sdk */
        window.gameShouldForeground();
    }
};

const gameLoadedSdkCallbackInternal = (config?: Partial<GameLoadedSdkConfig>) => {
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
                if (isSdkSupportGameShouldForegroundCallback()) {
                    window.Android.gameLoaded();
                } else {
                    // old SDK API style
                    window.Android.gameLoaded(JSON.stringify({ showClose, backGesture }));
                }
            }
        } else if (isIos) {
            if (iosMh.gameLoaded !== undefined) {
                if (isSdkSupportGameShouldForegroundCallback()) {
                    iosMh.gameLoaded.postMessage("");
                } else {
                    // old SDK API style
                    iosMh.gameLoaded.postMessage(JSON.stringify({ showClose, backGesture: false }));
                }
            }
        } else if (isWeb) {
            if (webSource.sourceWindow && webSource.sourceWindowOrigin) {
                if (isSdkSupportGameShouldForegroundCallback()) {
                    webSource.sourceWindow.postMessage(["gameLoaded"], webSource.sourceWindowOrigin);
                } else {
                    // old SDK API style
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
        }
        window.gameLoadingInfo.state = "after call gameLoadedSdkCallback";
        window.gameLoadingInfo.description = "";
        window.gameLoadingInfo.loaded = true;

        if (!isSdkSupportGameShouldForegroundCallback()) {
            gameOnForegroundResolve();
        }
    } catch (e) {
        logError(e, { src: "gameLoadedSdkCallback" });
    }
};

const _gameLoadingInfoCreated = {
    loadStarted: false,
    loaded: false,
    state: "gameReader API created",
    description: "",
    error: "",
    gameLaunchRawConfig: undefined,
};
if (window.gameLoadingInfo != null) {
    window.gameLoadingInfo = { ...window.gameLoadingInfo, ..._gameLoadingInfoCreated };
} else {
    window.gameLoadingInfo = _gameLoadingInfoCreated;
}

export const gameLoadFailedSdkCallback = (reason: string, canTryReload: boolean) => {
    let loaded = false;
    if (window.gameLoadingInfo != null && window.gameLoadingInfo.loaded != null) {
        loaded = window.gameLoadingInfo.loaded;
    }
    if (!loaded) {
        if (window.gameLoadingInfo != null) {
            window.gameLoadingInfo.state = "before call gameLoadFailedSdkCallback";
            window.gameLoadingInfo.description = reason;
        }
        if (isAndroid) {
            if (window.Android.gameLoadFailed) {
                window.Android.gameLoadFailed(reason, canTryReload);
            }
        } else if (isIos) {
            if (iosMh.gameLoadFailed) {
                iosMh.gameLoadFailed.postMessage(JSON.stringify({ reason, canTryReload }));
            }
        } else if (isWeb) {
            if (webSource.sourceWindow != null && webSource.sourceWindowOrigin != null) {
                webSource.sourceWindow.postMessage(["gameLoadFailed", reason, canTryReload], webSource.sourceWindowOrigin);
            }
        }
        gameOnForegroundReject(reason);
    }
};

window.gameLoadFailed = gameLoadFailedSdkCallback;

export const createGameShouldForeground = (gameShouldForeground: () => void) => {
    window.gameShouldForeground = gameShouldForeground;
};

type GameShouldForegroundConfig = Partial<{
    showClose: boolean; // display native close btn or not
    backGesture: boolean; // catch native navigator back action (Android only)
}>;

/**
 * API method for remove loader screen from Reader
 */
export const gameShouldForegroundCallback = (config?: Partial<GameShouldForegroundConfig>) => {
    if (isSdkSupportGameShouldForegroundCallback()) {
        gameShouldForegroundCallbackInternal(config);
    } else {
        /** For old sdk - use gameLoadedSdkCallbackInternal with config (for remove splash) */
        gameLoadedSdkCallbackInternal(config);
    }
};

const gameShouldForegroundCallbackInternal = (config?: Partial<GameShouldForegroundConfig>) => {
    let showClose = config?.showClose;
    if (showClose == null) {
        showClose = false;
    }
    let backGesture = config?.backGesture;
    if (backGesture == null) {
        backGesture = true;
    }

    if (isAndroid) {
        if (window.Android.gameShouldForegroundCallback) {
            window.Android.gameShouldForegroundCallback(JSON.stringify({ showClose, backGesture }));
        }
    } else if (isIos) {
        if (iosMh.gameShouldForegroundCallback) {
            iosMh.gameShouldForegroundCallback.postMessage(JSON.stringify({ showClose, backGesture: false }));
        }
    } else if (isWeb) {
        if (webSource.sourceWindow && webSource.sourceWindowOrigin) {
            webSource.sourceWindow.postMessage(
                [
                    "gameShouldForegroundCallback",
                    JSON.stringify({
                        showClose,
                        backGesture,
                    }),
                ],
                webSource.sourceWindowOrigin
            );
        }
    }

    gameOnForegroundResolve();
};

const isSdkSupportGameShouldForegroundCallback = () => {
    if (isAndroid) {
        return "gameShouldForegroundCallback" in window.Android;
    } else if (isIos) {
        return "gameShouldForegroundCallback" in iosMh;
    } else if (isWeb) {
        let support = false;
        const semverVersion = getSemverSdkVersion();
        if (semverVersion != null && semverVersion) {
            // for js-sdk
            // gte(v1, v2): v1 >= v2
            if (semver.gte(semverVersion, "2.12.0-rc.11")) {
                support = true;
            }
        }
        // for react-sdk
        if (gameLaunchConfig.clientConfig?.sdkFeatures?.gameShouldForegroundCallback === true) {
            support = true;
        }
        return support;
    }
};

let gameOnForegroundResolve: () => void = () => {};
let gameOnForegroundReject: (reason?: any) => void = () => {};
export const gameOnForeground = new Promise<void>((resolve, reject) => {
    gameOnForegroundResolve = resolve;
    gameOnForegroundReject = reject;
});

gameOnForeground.catch(e => {
    console.log("on gameOnForeground reject", e);
});
