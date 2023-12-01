import {GameLaunchConfig} from "./gameLaunchConfig.h";
import {getSemverSdkVersion, isAndroid} from "./env";
import semver from "semver";
import {base64url_decode} from "./helpers/base64urlDecode";

export const gameLaunchConfig = {} as GameLaunchConfig;

export function setGameLaunchConfig(config: GameLaunchConfig) {
    for (const key in config) {
        // @ts-ignore
        gameLaunchConfig[key] = config[key];
    }

    checkUserId(gameLaunchConfig?.clientConfig.userId);

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



function checkUserId(userId: string|number) {
    let emptyUserIdFromSdk = false;
    if (isAndroid) {
        const semverVersion = getSemverSdkVersion();
        if (semverVersion != null && semverVersion) {
            // lte(v1, v2): v1 <= v2
            if (semver.lte(semverVersion, "1.16.2")) {
                emptyUserIdFromSdk = true;
            }
        }
    }

    if (!userId && emptyUserIdFromSdk && getSessionId()) {
        let data = base64url_decode(getSessionId());
        const version = data.charCodeAt(0);

        if (version === 3) {
            const tagCount = data.charCodeAt(21);
            const offsetForExternalUserId = 21 + tagCount * 4 + 1;
            const externalIdLen = data.charCodeAt(offsetForExternalUserId);
            if (externalIdLen > 0) {
                gameLaunchConfig.clientConfig && (gameLaunchConfig.clientConfig.userId = data.substring(offsetForExternalUserId + 1, offsetForExternalUserId + 1 + externalIdLen).replace(/\0+$/, ''));
            }
        }

    }

}
