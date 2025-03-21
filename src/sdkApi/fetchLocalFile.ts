import { getSemverSdkVersion, isAndroid, isIos } from "../env";
import { logError } from "../eventLogger";

const semver = require("semver");

let instance: URLResolver;

class URLResolver {
    private _link;

    private constructor() {
        this._link = document.createElement("a");
    }

    public static getInstance() {
        if (instance == null) {
            instance = new URLResolver();
        }
        return instance;
    }

    public resolve(url: string): string {
        this._link.href = url;
        return this._link.href;
    }
}

function fetchLocalAndroid(url: string) {
    if (url.substring(0, 1) === "/" || url.substring(0, 2) === "./") {
        url = URLResolver.getInstance().resolve(url);
    }

    // if sdk 1.16.2+
    return fetch(url.replace("file:///", "http://file-assets/"));
}

export function fetchLocalFile(url: string, remoteUrl?: string): Promise<Response | undefined> {
    if (isAndroid) {
        const semverVersion = getSemverSdkVersion();
        let sdkSupportFileAssetsProtocol = true;
        let sdkCanFetchLocalFile = true;

        if (semverVersion != null && semverVersion) {
            // 1.16.0 - 1.16.1
            // gte(v1, v2): v1 >= v2
            // lte(v1, v2): v1 <= v2
            if (semver.gte(semverVersion, "1.16.0") && semver.lte(semverVersion, "1.16.1")) {
                sdkCanFetchLocalFile = false;
            }

            if (semver.lt(semverVersion, "1.16.2")) {
                sdkSupportFileAssetsProtocol = false;
            }
        }

        if (sdkSupportFileAssetsProtocol) {
            return fetchLocalAndroid(url);
        } else {
            if (!sdkCanFetchLocalFile) {
                remoteUrl += "&stamp=" + new Date().getTime();
                if (!remoteUrl) {
                    return Promise.resolve(undefined);
                }
                return fetch(remoteUrl);
            } else {
                return new Promise(function (resolve, reject) {
                    const xhr = new XMLHttpRequest();
                    xhr.onload = function () {
                        // status 0 in android 9+
                        try {
                            resolve(new Response(xhr.response, { status: xhr.status >= 200 && xhr.status <= 599 ? xhr.status : 200 }));
                        } catch (e) {
                            logError(e);
                            reject(e);
                        }
                    };
                    xhr.onerror = function () {
                        reject(new TypeError("Local request failed"));
                    };
                    xhr.open("GET", url);
                    xhr.responseType = "arraybuffer";
                    xhr.send(null);
                });
            }
        }
    } else if (isIos) {
        // https://stackoverflow.com/questions/40182785/why-fetch-return-a-response-with-status-0
        // Effectively, the response you get from making such a request (with no-cors specified as a mode) will contain no information about whether the request succeeded or failed, making the status code 0.
        // Welcome to the insane and wonderful world of CORS. A necessary(?) evil; CORS is a huge pain the ass for web developers.
        // fetch local file on iOS return status 0, response.ok = false
        // fallback via wrap fetch result into new Response with status 200
        // assume that failed load - trigger catch by origin fetch
        return new Promise(function (resolve, reject) {
            fetch(url)
                .then(response => {
                    if (response.status === 0) {
                        resolve(new Response(response.body, { status: 200 }));
                    } else {
                        resolve(response);
                    }
                })
                .catch(reject);
        });
    } else {
        return fetch(url);
    }
}
