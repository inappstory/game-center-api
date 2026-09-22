import { GameResources } from "./gameResources.h";

export enum PlaceholderType {
    TEXT = "text",
    IMAGE = "image",
}

export type Placeholder = {
    type: PlaceholderType;
    name: string;
    value: string;
    originValue?: string;
};

export enum ScreenOrientation {
    PORTRAIT = "portrait",
    LANDSCAPE = "landscape",
}

export enum CloseButtonBehavior {
    CLOSE_GAME = "closeGame",
    GO_TO_MAIN = "goToMain",
    HIDDEN = "hidden",
}

export enum Platform {
    IOS = "ios",
    ANDROID = "android",
    DESKTOP = "desktop",
}

export type GameLaunchConfig = {
    gameInstanceId: number;
    gameResources: GameResources;
    gameImagePlaceholders: Array<string>; // list of game used ImagePlaceholder
    projectSlug: string;
    demoMode: boolean;
    projectEnv: "test" | "prod";
    gameDomain: string;
    gameSlug: string;
    gameVersion: string;
    verbose: boolean;
    authUrl: string;
    payload: string;
    localization: { lang: string; resources: Record<string, Record<string, string>> | null };
    schemeAppearance?: Record<string, unknown>;
    clientConfig: {
        apiBaseUrl: string;
        apiKey: string;
        appPackageId: string;
        deviceId: string;
        fullScreen: boolean;
        widescreen: boolean;
        lang: string;
        dir: "ltr" | "rtl";
        placeholders: Array<Placeholder>;
        safeAreaInsets: {
            bottom: number;
            left: number;
            right: number;
            top: number;
        };
        screenOrientation: ScreenOrientation;
        sdkVersion: string;
        sdkFeatures?: {
            gameShouldForegroundCallback?: boolean;
            writeToClipboard?: boolean;
            showTextInput?: boolean;
        };
        sessionId: string;
        userAgent: string;
        userId: string;
        nonce?: string;
        variables: Record<string, any>;
        closeButtonBehavior: CloseButtonBehavior;
        platform: Platform;
    };
};
