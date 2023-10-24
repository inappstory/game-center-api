import {getSdkVersion, getSemverSdkVersion, isAndroid, isDev, isIos, isWeb } from "./env";
import { gameLaunchConfig, getIsDemoMode, getSessionId, getApiBaseUrl } from "./gameLaunchConfig";
import { getDynamicResourceAsset, getDynamicResourceFont, getProjectFontFamilyStylesheet } from "./gameResources";
import { sendIasApiRequest } from "./iasApi";
import { gameLocalData } from "./localData";
import {closeGameReader, createSdkApi } from "./sdkApi";
import { gameLoadedSdkCallback } from "./sdkApi/initGame";
import { openUrl } from "./sdkApi/openUrl";
import { share } from "./sdkApi/share";
import { vibrate } from "./sdkApi/vibrate";
import { ScreenOrientation, Placeholder, PlaceholderType } from "./gameLaunchConfig.h";
import { fetchLocalFile } from "./sdkApi/fetchLocalFile";


export type {ShareData as SDKShareData} from "./sdkApi/share";
export type {PrimaryFontVariants as SDKPrimaryFontVariants, SecondaryFontVariants as SDKSecondaryFontVariants } from "./gameResources";
export type {OpenUrlOptions as SDKOpenUrlOptions} from "./sdkApi/openUrl.h";
export type { RequestInfo as APIRequestInfo, Response as APIResponse } from "./iasApi";

export type  {Placeholder};

export type { ProjectFontFamily } from "./gameResources";

export {
    createSdkApi, closeGameReader, gameLoadedSdkCallback, gameLaunchConfig,
    isIos, isWeb, isAndroid, isDev,
    getSdkVersion, getSemverSdkVersion,
    gameLocalData, sendIasApiRequest, openUrl, share, vibrate, getDynamicResourceAsset,
    getDynamicResourceFont, getProjectFontFamilyStylesheet, getIsDemoMode, getSessionId, getApiBaseUrl,
    ScreenOrientation, PlaceholderType, fetchLocalFile
}


const GameCenterApi = {
    createSdkApi, closeGameReader, gameLoadedSdkCallback, gameLaunchConfig,
    isIos, isWeb, isAndroid, isDev,
    getSdkVersion, getSemverSdkVersion,
    gameLocalData, sendIasApiRequest, openUrl, share, vibrate, getDynamicResourceAsset,
    getDynamicResourceFont, getProjectFontFamilyStylesheet, getIsDemoMode, getSessionId, getApiBaseUrl,
    ScreenOrientation, PlaceholderType, fetchLocalFile
}

export { GameCenterApi as default };

// export { Placeholder as default};


// types
// placeholders
// network



