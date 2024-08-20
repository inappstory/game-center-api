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

/**
 * For match app build version and app sem version from user agent
 * InAppStorySDK/750 Dalvik/2.1.0 (Linux; U; Android 11; XQ-AT51 Build/58.1.A.5.530) Application/258 (com.inappstory.android 3.1.0)
 */
const appVersionFromUserAgentRegexp = /.*Application\/(\d+)\s\([a-zA-Z.]+\s([0-9.]+)\)/;

/**
 * Get host application build version
 */
const getApplicationBuildVersion = (): number | null => {
    const userAgent = gameLaunchConfig.clientConfig.userAgent;
    if (userAgent) {
        const match = userAgent.match(appVersionFromUserAgentRegexp);
        if (match && match[1]) {
            return parseInt(match[1]);
        }
    }
    return null;
};

/**
 * Get host application sem version
 */
const getApplicationVersion = (): string | null => {
    const userAgent = gameLaunchConfig.clientConfig.userAgent;
    if (userAgent) {
        const match = userAgent.match(appVersionFromUserAgentRegexp);
        if (match && match[2]) {
            return match[2];
        }
    }
    return null;
};

export { isIos, isWeb, isAndroid, iosMh, isDev, getSdkVersion, getSemverSdkVersion, getApplicationBuildVersion, getApplicationVersion };
