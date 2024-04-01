import { SemVer } from "semver";
import { gameLaunchConfig } from "./gameLaunchConfig";

const semver = require("semver");

declare global {
    interface Window {
        // _log: (msg: string) => void;
        Android: Record<string, any>;
        webkit: {
            messageHandlers: Record<string, any>;
        };
    }
}

const isAndroid = Boolean(window.Android && window.Android.gameLoaded);
// todo как то улучшить detector
const isIos = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.gameLoaded;
const isWeb = !isAndroid && !isIos;

let iosMh: Record<string, any> = {};
if (isIos) {
    iosMh = window.webkit.messageHandlers;
}

const isDev = process.env.NODE_ENV === "development";

let sdkVersion: string | null | false = false;
let semverSdkVersion: SemVer | null | false = false;

const parseSdkVersion = () => {
    try {
        const semverResult = semver.parse(gameLaunchConfig.clientConfig.sdkVersion);
        if (semverResult != null) {
            sdkVersion = gameLaunchConfig.clientConfig.sdkVersion;
            semverSdkVersion = semverResult;
        }
    } catch (e) {
        console.error(e);
    }
};

const getSdkVersion = () => {
    if (sdkVersion === false || semverSdkVersion === false) {
        parseSdkVersion();
    }
    return sdkVersion;
};

const getSemverSdkVersion = () => {
    if (sdkVersion === false || semverSdkVersion === false) {
        parseSdkVersion();
    }
    return semverSdkVersion;
};

export { isIos, isWeb, isAndroid, iosMh, isDev, getSdkVersion, getSemverSdkVersion };
