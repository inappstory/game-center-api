import EventEmitter from "eventemitter3";
import { iosMh, isAndroid, isIos } from "../env";

const enum SENSOR_STATE {
    UNDEFINED,
    INIT,
    START,
    STOP,
    ERROR,
}

export class UserAccelerationSensor extends EventEmitter<"activate" | "reading" | "error"> {
    constructor(private readonly _options: { frequency: number }) {
        super();
        if (!UserAccelerationSensor.isAvailableOnPlatform) {
            throw new Error("UserAccelerationSensor isn't supported on this platform");
        }
        this._init();

        // add callbacks
        window.userAccelerationSensorCbActivate = () => {
            this.emit("activate");
        };
        window.userAccelerationSensorCbRead = (x: number, y: number, z: number) => {
            this.emit("reading", { x, y, z });
        };
        window.userAccelerationSensorCbError = (type: string, message: string) => {
            this._state = SENSOR_STATE.ERROR;
            const error = new Error();
            error.name = type;
            error.message = message;
            this.emit("error", { error });
        };
    }
    private _state: SENSOR_STATE = SENSOR_STATE.UNDEFINED;

    static get isAvailableOnPlatform() {
        if (isAndroid && window.Android.initUserAccelerationSensor != null) {
            return true;
        } else if (isIos && iosMh.initUserAccelerationSensor != null) {
            return true;
        }
        return false;
    }

    private _init(): void {
        if (isAndroid) {
            window.Android.initUserAccelerationSensor(JSON.stringify(this._options));
            this._state = SENSOR_STATE.INIT;
        } else if (isIos) {
            iosMh.initUserAccelerationSensor.postMessage(JSON.stringify(this._options));
            this._state = SENSOR_STATE.INIT;
        }
    }

    public start(): void {
        if (this._state !== SENSOR_STATE.INIT) {
            throw new Error(`Incorrect sensor state: ${this._state}`);
        }
        if (isAndroid) {
            window.Android.startUserAccelerationSensor();
            this._state = SENSOR_STATE.START;
        } else if (isIos) {
            iosMh.startUserAccelerationSensor.postMessage(JSON.stringify({}));
            this._state = SENSOR_STATE.START;
        }
    }

    public stop(): void {
        if (!(this._state === SENSOR_STATE.START || this._state === SENSOR_STATE.ERROR)) {
            throw new Error(`Incorrect sensor state: ${this._state}`);
        }
        if (isAndroid) {
            window.Android.stopUserAccelerationSensor();
            this._state = SENSOR_STATE.STOP;
        } else if (isIos) {
            iosMh.stopUserAccelerationSensor.postMessage(JSON.stringify({}));
            this._state = SENSOR_STATE.STOP;
        }
    }
}

declare global {
    interface Window {
        userAccelerationSensorCbActivate: () => void;
        userAccelerationSensorCbRead: (x: number, y: number, z: number) => void;
        userAccelerationSensorCbError: (type: string, message: string) => void;
    }
}

window.userAccelerationSensorCbActivate = () => {};
window.userAccelerationSensorCbRead = (x: number, y: number, z: number) => {};
window.userAccelerationSensorCbError = (type: string, message: string) => {};
