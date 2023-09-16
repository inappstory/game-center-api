import {getSdkVersion, getSemverSdkVersion, isAndroid, isDev, isIos, isWeb } from "./env";
import { gameLaunchConfig } from "./gameLaunchConfig";
import { getDynamicResourceAsset, getDynamicResourceFont, getProjectFontFamilyStylesheet } from "./gameResources";
import { sendIasApiRequest } from "./iasApi";
import { gameLocalData } from "./localData";
import {closeGameReader, createSdkApi } from "./sdkApi";
import { gameLoadedSdkCallback } from "./sdkApi/initGame";
import { openUrl } from "./sdkApi/openUrl";
import { share } from "./sdkApi/share";
import { vibrate } from "./sdkApi/vibrate";

export type {ShareData as SDKShareData} from "./sdkApi/share";
export type {PrimaryFontVariants as SDKPrimaryFontVariants, SecondaryFontVariants as SDKSecondaryFontVariants } from "./gameResources";
export type {OpenUrlOptions as SDKOpenUrlOptions} from "./sdkApi/openUrl.h";

export {
    createSdkApi, closeGameReader, gameLoadedSdkCallback, gameLaunchConfig, isIos, isWeb, isAndroid, isDev, getSdkVersion, getSemverSdkVersion,
    gameLocalData, sendIasApiRequest, openUrl, share as sdkShare, vibrate as sdkVibrate, getDynamicResourceAsset,
    getDynamicResourceFont as sdkGetDynamicResourceFont, getProjectFontFamilyStylesheet as sdkGetProjectFontFamilyStylesheet
}


