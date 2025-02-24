import { gameLaunchConfig } from "./gameLaunchConfig";
import { v4 as uuidV4 } from "uuid";
import { logError } from "./eventLogger";

const prepareHeaders = (headers: RequestInfo["headers"]) => ({
    ...{
        "Content-Type": "application/json",
        "Auth-Session-Id": gameLaunchConfig.clientConfig.sessionId,
        Authorization: `Bearer ${gameLaunchConfig.clientConfig.apiKey}`,
        "X-Device-Id": gameLaunchConfig.clientConfig.deviceId,
        "X-User-Id": gameLaunchConfig.clientConfig.userId ?? "",
        "X-Request-Id": uuidV4(),
        "X-User-Agent": gameLaunchConfig.clientConfig.userAgent,
        "X-App-Package-Id": gameLaunchConfig.clientConfig.appPackageId,
    },
    ...headers,
});

const getBaseUrl = () => {
    let url = gameLaunchConfig.clientConfig.apiBaseUrl;
    if (url.length > 0) {
        if (url.substring(url.length - 1) === "/") {
            url = url.substring(0, url.length - 1);
        }
    }
    return url;
};

const prepareUrl = (endpoint: string) => `${getBaseUrl()}/v2/game/${gameLaunchConfig.gameInstanceId}/${endpoint}`;

export type RequestInfo = {
    method: "GET" | "POST" | "PUT" | "DELETE";
    path: string;
    data?: Record<string, any>;
    headers?: Record<string, any>;
};
export type Response<T> = {
    status: number;
    payload: T;
    error: any;
    isOk: boolean;
};
export async function sendIasApiRequest<T>(requestInfo: RequestInfo): Promise<Response<T>> {
    // Default options are marked with *
    const result: Response<T> = {
        status: 0,
        payload: {} as T,
        error: null,
        isOk: false,
    };
    let url = "";
    let requestInit: RequestInit = null!;
    try {
        url = prepareUrl(requestInfo.path);
        requestInit = {
            method: requestInfo.method, // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, *cors, same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            credentials: "omit", // include, *same-origin, omit
            headers: prepareHeaders(requestInfo.headers),
            redirect: "follow", // manual, *follow, error
            referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(requestInfo.data), // body data type must match "Content-Type" header
        };
    } catch (e) {
        logError(e, { requestInfo });
    }
    try {
        const response = await fetch(url, requestInit);

        result.status = response.status;
        result.payload = (await response.json()) as T; // parses JSON response into native JavaScript objects
        if (response.status >= 200 && response.status < 300) {
            result.isOk = true;
        }
    } catch (e) {
        result.error = e;
        logError(e, { url, requestInit });
    }
    return result;
}
