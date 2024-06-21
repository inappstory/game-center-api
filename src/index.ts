import { getApplicationBuildVersion, getApplicationVersion, getSdkVersion, getSemverSdkVersion, isAndroid, isDev, isIos, isWeb } from "./env";
import { gameLaunchConfig, getIsDemoMode, getSessionId, getApiBaseUrl } from "./gameLaunchConfig";
import {
    getDynamicResourceAsset,
    getDynamicResourceFont,
    getProjectFontFamilyStylesheet,
    dynamicResourceAssets,
    dynamicResourceFonts,
    staticResourcesImagePlaceholders,
    StaticResourceList,
} from "./gameResources";
import { sendIasApiRequest } from "./iasApi";
import { gameLocalData } from "./localData";
import { closeGameReader, createSdkApi, reloadGameReader } from "./sdkApi";
import { gameLoadedSdkCallback, gameLoadFailedSdkCallback, gameShouldForegroundCallback, gameOnForeground } from "./sdkApi/initGame";
import { openUrl } from "./sdkApi/openUrl";
import { share } from "./sdkApi/share";
import { vibrate } from "./sdkApi/vibrate";
import { ScreenOrientation, Placeholder, PlaceholderType, GameLaunchConfig } from "./gameLaunchConfig.h";
import { fetchLocalFile } from "./sdkApi/fetchLocalFile";

import { openStory } from "./sdkApi/openStory";
import { eventGame } from "./sdkApi/events";

import { ResourceManager } from "./ResourceManager";
import { hasFilePickerApi, openFilePicker } from "./sdkApi/filePicker";
import { FilePickerResultType, isFilePickerResultFileList, isFilePickerResultLocalFileList, isLocalFile } from "./sdkApi/filePicker.h";

export type { OpenFilePickerProps, SDKFileResponse, LocalFile, LocalFileList, FilePickerResultPayload, FilePickerResult } from "./sdkApi/filePicker.h";

export type { ShareData as SDKShareData } from "./sdkApi/share";
export type { PrimaryFontVariants as SDKPrimaryFontVariants, SecondaryFontVariants as SDKSecondaryFontVariants } from "./gameResources";
export type { OpenUrlOptions as SDKOpenUrlOptions } from "./sdkApi/openUrl.h";
export type { RequestInfo as APIRequestInfo, Response as APIResponse } from "./iasApi";

export type { Placeholder, GameLaunchConfig };

export type { ProjectFontFamily } from "./gameResources";
export type { ResourceInterface } from "./ResourceManager";

export {
    createSdkApi,
    closeGameReader,
    gameLoadedSdkCallback,
    gameLoadFailedSdkCallback,
    gameLaunchConfig,
    isIos,
    isWeb,
    isAndroid,
    isDev,
    getSdkVersion,
    getSemverSdkVersion,
    gameLocalData,
    sendIasApiRequest,
    openUrl,
    share,
    vibrate,
    getDynamicResourceAsset,
    getDynamicResourceFont,
    getProjectFontFamilyStylesheet,
    getIsDemoMode,
    getSessionId,
    getApiBaseUrl,
    ScreenOrientation,
    PlaceholderType,
    fetchLocalFile,
    openStory,
    ResourceManager,
    dynamicResourceAssets,
    dynamicResourceFonts,
    staticResourcesImagePlaceholders,
    StaticResourceList,
    eventGame,
    reloadGameReader,
    openFilePicker,
    FilePickerResultType,
    isFilePickerResultFileList,
    isFilePickerResultLocalFileList,
    isLocalFile,
    hasFilePickerApi,
    gameShouldForegroundCallback,
    gameOnForeground,
    getApplicationVersion,
    getApplicationBuildVersion,
};

const GameCenterApi = {
    createSdkApi,
    closeGameReader,
    gameLoadedSdkCallback,
    gameLoadFailedSdkCallback,
    gameLaunchConfig,
    isIos,
    isWeb,
    isAndroid,
    isDev,
    getSdkVersion,
    getSemverSdkVersion,
    gameLocalData,
    sendIasApiRequest,
    openUrl,
    share,
    vibrate,
    getDynamicResourceAsset,
    getDynamicResourceFont,
    getProjectFontFamilyStylesheet,
    getIsDemoMode,
    getSessionId,
    getApiBaseUrl,
    ScreenOrientation,
    PlaceholderType,
    fetchLocalFile,
    openStory,
    ResourceManager,
    dynamicResourceAssets,
    dynamicResourceFonts,
    staticResourcesImagePlaceholders,
    StaticResourceList,
    eventGame,
    reloadGameReader,
    openFilePicker,
    FilePickerResultType,
    isFilePickerResultFileList,
    isFilePickerResultLocalFileList,
    isLocalFile,
    hasFilePickerApi,
    gameShouldForegroundCallback,
    gameOnForeground,
    getApplicationVersion,
    getApplicationBuildVersion,
};

export { GameCenterApi as default };

// export { Placeholder as default};

// types
// placeholders
// network
