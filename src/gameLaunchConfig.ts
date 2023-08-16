import {GameLaunchConfig} from "./gameLaunchConfig.h";

export const gameLaunchConfig = {} as GameLaunchConfig;

export function setGameLaunchConfig(config: GameLaunchConfig) {
    for (const key in config) {
        // @ts-ignore
        gameLaunchConfig[key] = config[key];
    }

    Object.freeze(gameLaunchConfig);
}


export function getGameInstanceId(): number {
    return gameLaunchConfig.gameInstanceId;
}

export function getIsDemoMode(): boolean {
    return gameLaunchConfig.demoMode;
}

export function getSessionId() {
    return gameLaunchConfig.clientConfig.sessionId;
}

export function getApiBaseUrl() {
    return gameLaunchConfig.clientConfig.apiBaseUrl;
}
