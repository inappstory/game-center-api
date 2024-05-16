import { v4 as uuidV4 } from "uuid";
import { iosMh, isAndroid, isDev, isIos, isWeb } from "./env";
import { asyncQueue } from "./asyncQueue";
import { getGameInstanceId } from "./gameLaunchConfig";
import { webSource } from "./sdkApi/web/Source";
import { sendIasApiRequest } from "./iasApi";

export class LocalDataMap<K, V> extends Map<K, V> {
    set(key: K, value: V) {
        super.set(key, value);

        if (localDataCreated) {
            // skip special logic for map.set call from Map constructor
            setGameLocalData();
        }
        return this;
    }

    delete(key: K): boolean {
        const removed = super.delete(key);
        if (removed) {
            // skip if element with key does not exist in Map
            setGameLocalData();
        }

        return removed;
    }

    protected init(entries: [K, V][]) {
        entries.forEach(entrie => super.set(entrie[0], entrie[1]));

        return this;
    }
}

export let gameLocalData: LocalDataMap<string, any> = new LocalDataMap();
let localDataCreated = false;

export const initLocalData: () => Promise<void> = async () => {
    if (localDataCreated) {
        console.warn("Duplicate call of initLocalData. Skipping");
    }

    (gameLocalData as any).init(Object.entries(await getClientLocalData()));
    localDataCreated = true;
};

/**
 * Fetch story local data from client device
 */
const getClientLocalData = async () => {
    const gameInstanceId = getGameInstanceId();
    if (isDev) {
        if (gameInstanceId) {
            const localData = localStorage.getItem("gameCenter_" + gameInstanceId + "_data");
            if (localData) {
                return JSON.parse(localData);
            }
        }

        return {};
    }

    console.log(`call getGameInstanceLocalData with gameInstanceId: ${gameInstanceId}`);

    if (gameInstanceId == null) {
        // Prevent call with incorrect storyId
        console.error("Call getGameInstanceLocalData with empty `gameInstanceId`");
        return {};
    }

    if (isAndroid) {
        if ("gameInstanceGetLocalData" in window.Android) {
            const localData = window.Android.gameInstanceGetLocalData(gameInstanceId);
            // todo merge with server data
            if (localData) {
                return JSON.parse(localData);
            }
        }
        return {};
    } else if (isIos) {
        const id = uuidV4();

        if (window.webkit.messageHandlers.gameInstanceGetLocalData !== undefined) {
            // todo merge with server data
            window.webkit.messageHandlers.gameInstanceGetLocalData.postMessage(
                JSON.stringify({
                    id,
                    gameInstanceId,
                    callback: "gameInstanceGetLocalDataCb",
                })
            );

            return new Promise((resolve, reject) => {
                asyncQueue.set(id, (data: Record<string, any>) => resolve(data));
            });
        }
        return {};
    } else if (isWeb) {
        const id = uuidV4();

        // todo merge with server data

        const plainData = JSON.stringify({
            id,
            gameInstanceId,
            callback: "gameInstanceGetLocalDataCb",
        });

        if (webSource.sourceWindow && webSource.sourceWindowOrigin) {
            webSource.sourceWindow.postMessage(["gameInstanceGetLocalData", plainData], webSource.sourceWindowOrigin);
        }

        // fallback
        setTimeout(() => {
            window.gameInstanceGetLocalDataCb(id, "{}");
        }, 1000);

        return new Promise((resolve, reject) => {
            asyncQueue.set(id, (data: Record<string, any>) => resolve(data));
        });
    }
};

declare global {
    interface Window {
        gameInstanceGetLocalDataCb: (id: string, plainData: string) => void;
    }
}

window.gameInstanceGetLocalDataCb = function (id: string, plainData: string) {
    let localData = {};
    try {
        localData = JSON.parse(plainData);
    } catch (e) {
        console.error(e, { inputData: plainData });
    } finally {
        if (asyncQueue.has(id)) {
            const cb = asyncQueue.get(id);
            cb(localData);
            asyncQueue.delete(id);
        }
    }
};

// api requests wrapper

const setGameLocalData = async (sendToServer: boolean = true) => {
    const data = Object.fromEntries(gameLocalData);

    const sendDataToServer = () => sendIasApiRequest({ method: "PUT", path: "instance-user-data", data: { data } });

    const gameInstanceId = getGameInstanceId();

    if (gameInstanceId == null) {
        // Prevent call with incorrect storyId
        console.error("Call getGameInstanceLocalData with empty `gameInstanceId`");
        return;
    }

    if (process.env.NODE_ENV === "development") {
        const gameInstanceId = getGameInstanceId();
        if (gameInstanceId) {
            localStorage.setItem("gameCenter_" + gameInstanceId + "_data", JSON.stringify(data));
            if (sendToServer) {
                // todo implement if need it
            }
        }
        return;
    }

    if (isAndroid) {
        if ("gameInstanceSetLocalData" in window.Android) {
            window.Android.gameInstanceSetLocalData(gameInstanceId, JSON.stringify(data), sendToServer);
        }
    } else if (isIos) {
        if (iosMh.gameInstanceSetLocalData !== undefined) {
            iosMh.gameInstanceSetLocalData.postMessage(
                JSON.stringify({
                    gameInstanceId,
                    data,
                    sendToServer: sendToServer,
                })
            );
        }
    } else if (isWeb) {
        const plainData = JSON.stringify({
            gameInstanceId,
            data,
            sendToServer: sendToServer,
        });

        if (webSource.sourceWindow && webSource.sourceWindowOrigin) {
            webSource.sourceWindow.postMessage(["gameInstanceSetLocalData", plainData], webSource.sourceWindowOrigin);
        }
    }
};
