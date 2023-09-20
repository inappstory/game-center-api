import {GameResources} from "./gameResources.h";

export type GameLaunchConfig = {
    gameInstanceId: number,
    gameResources: GameResources,
    projectSlug: string,
    demoMode: boolean,
    projectEnv: "test" | "prod",
    gameDomain: string,
    gameSlug: string,
    gameVersion: string,
    verbose: boolean,
    clientConfig: {
        apiBaseUrl: string,
        apiKey: string,
        appPackageId: string,
        deviceId: string,
        fullScreen: boolean,
        lang: string,
        placeholders: Array<{name: string, type: "text" | "image", value: string}>,
        safeAreaInsets: {
            bottom: number,
            left: number,
            right: number,
            top: number
        },
        screenOrientation: "portrait" | "landscape",
        sdkVersion: string,
        sessionId: string,
        userAgent: string,
        userId: string,
    },
};
