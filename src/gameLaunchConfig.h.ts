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

export type GameLaunchConfig = {
    gameInstanceId: number;
    gameResources: GameResources;
    projectSlug: string;
    demoMode: boolean;
    projectEnv: "test" | "prod";
    gameDomain: string;
    gameSlug: string;
    gameVersion: string;
    verbose: boolean;
    authUrl: string;
    payload: string;
    localization: { lang: string; resources: Record<string, string> | null };
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
        };
        sessionId: string;
        userAgent: string;
        userId: string;
        nonce?: string;
    };
};
