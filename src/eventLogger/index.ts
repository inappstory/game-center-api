import { SeverityLevel as SentrySeverityLevel, Exception as SentryException } from "@sentry/browser";
import { defaultStackParser } from "./stack-parsers";
import { TraceablePromise } from "../TraceablePromise";

/**
 * for call instead of console.error(err)
 * this method collect Error stack to error logger
 **/
export const logError = (e: unknown, cause?: any): void => {
    let error: Error | null = null;

    if (e instanceof Error) {
        error = e as Error;
        if (cause != null) {
            error.cause = cause;
        }
    }

    if (typeof e === "string") {
        error = new Error(e);
    }

    if (error !== null) {
        // will be handled via sdk console.error override
        console.error(eventFromConsoleErrorMessage(e));
    } else {
        console.error(e);
    }
};

/** An event to be sent to API. */
interface Event {
    exception?: {
        values?: Array<Exception>;
    };
    level?: SentrySeverityLevel;
    source?: "onerror" | "onunhandledrejection" | "consoleErrorMessage";
    gameLoaded: boolean;
    gameLaunchRawConfig: Record<string, any>;
    gameVersion: string;
    gameSlug: string;
    sdkVersion: string;
    env: "prod" | "test" | "";
}

interface Exception extends SentryException {
    cause?: string;
}

// eslint-disable-next-line @typescript-eslint/unbound-method
const objectToString = Object.prototype.toString;

/**
 * Checks whether given value's type is an instance of provided constructor.
 * {@link isInstanceOf}.
 *
 * @param wat A value to be checked.
 * @param base A constructor to be used in a check.
 * @returns A boolean representing the result.
 */
function isInstanceOf(wat: any, base: any): boolean {
    try {
        return wat instanceof base;
    } catch (_e) {
        return false;
    }
}

/**
 * Checks whether given value's type is one of a few Error or Error-like
 * {@link isError}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isError(wat: unknown): wat is Error {
    switch (objectToString.call(wat)) {
        case "[object Error]":
        case "[object Exception]":
        case "[object DOMException]":
        case "[object WebAssembly.Exception]":
            return true;
        default:
            return isInstanceOf(wat, Error);
    }
}

/**
 * Checks whether given value is an instance of the given built-in class.
 *
 * @param wat The value to be checked
 * @param className
 * @returns A boolean representing the result.
 */
function isBuiltin(wat: unknown, className: string): boolean {
    return objectToString.call(wat) === `[object ${className}]`;
}

/**
 * Checks whether given value's type is an object literal, or a class instance.
 * {@link isPlainObject}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isPlainObject(wat: unknown): wat is Record<string, unknown> {
    return isBuiltin(wat, "Object");
}

function getException(exception: unknown): Error {
    if (isError(exception)) {
        return exception;
    }

    let message = "";
    if (isPlainObject(exception)) {
        try {
            message = JSON.stringify(exception);
        } catch (e) {
            // do nothing
        }
    } else if (typeof exception === "string") {
        message = exception;
    } else {
        try {
            message = JSON.stringify(exception);
        } catch (e) {
            // do nothing
        }
    }

    // This handles when someone does: `throw "something awesome";`
    // We use synthesized Error here so we can extract a (rough) stack trace.
    const ex = new Error(message);
    ex.message = `${message}`;

    return ex;
}

function flatErrorCause(error: Error): Array<Error> {
    const errors: Array<Error> = [error];
    const _getErrorOrErrorCause = (error: Error): Error | null => {
        if (isError(error.cause)) {
            errors.push(error.cause);
            return _getErrorOrErrorCause(error.cause);
        }
        return null;
    };
    _getErrorOrErrorCause(error);
    return errors;
}

function exceptionFromError(stackParser: typeof defaultStackParser, error: Error): Exception {
    const exception: Exception = {
        type: error.name || error.constructor.name,
        value: error.message,
    };
    if (error.cause != null && typeof error.cause === "string") {
        exception.cause = error.cause;
    }

    const frames = stackParser(error.stack || "", 0);
    if (frames.length) {
        exception.stacktrace = { frames };
    }

    return exception;
}

const eventFromException = (exception: unknown): Event => {
    const event: Event = {
        level: "error",
        source: "onerror",
        exception: {
            values: flatErrorCause(getException(exception)).map(error => exceptionFromError(defaultStackParser, error)),
        },
        gameLoaded: false,
        gameLaunchRawConfig: {},
        gameSlug: "",
        gameVersion: "",
        sdkVersion: "",
        env: "",
    };

    event.gameLoaded = window.gameLoadingInfo.loaded;
    if (window.gameLoadingInfo.gameLaunchRawConfig != null) {
        event.gameSlug = window.gameLoadingInfo.gameLaunchRawConfig.gameSlug;
        event.gameVersion = window.gameLoadingInfo.gameLaunchRawConfig.gameVersion;
        event.env = window.gameLoadingInfo.gameLaunchRawConfig.projectEnv;
        event.sdkVersion = window.gameLoadingInfo.gameLaunchRawConfig.clientConfig?.sdkVersion;
        event.gameLaunchRawConfig = window.gameLoadingInfo.gameLaunchRawConfig;
    }

    return event;
};

export const eventFromConsoleErrorMessage = (exception: unknown): Event => {
    const event: Event = {
        level: "error",
        source: "consoleErrorMessage",
        exception: {
            values: flatErrorCause(getException(exception)).map(error => exceptionFromError(defaultStackParser, error)),
        },
        gameLoaded: false,
        gameLaunchRawConfig: {},
        gameSlug: "",
        gameVersion: "",
        sdkVersion: "",
        env: "",
    };

    event.gameLoaded = window.gameLoadingInfo.loaded;
    if (window.gameLoadingInfo.gameLaunchRawConfig != null) {
        event.gameSlug = window.gameLoadingInfo.gameLaunchRawConfig.gameSlug;
        event.gameVersion = window.gameLoadingInfo.gameLaunchRawConfig.gameVersion;
        event.env = window.gameLoadingInfo.gameLaunchRawConfig.projectEnv;
        event.sdkVersion = window.gameLoadingInfo.gameLaunchRawConfig.clientConfig?.sdkVersion;
        event.gameLaunchRawConfig = window.gameLoadingInfo.gameLaunchRawConfig;
    }

    return event;
};

const eventFromUnhandledRejection = (rawEvent: PromiseRejectionEvent): Event => {
    let promiseErrors: Array<Exception> = [];
    if (isError(rawEvent.reason)) {
        promiseErrors = flatErrorCause(rawEvent.reason).map(error => exceptionFromError(defaultStackParser, error));
    }
    let stringReason = "";
    if (typeof rawEvent.reason === "string") {
        stringReason = rawEvent.reason;
    } else {
        try {
            stringReason = JSON.stringify(rawEvent.reason);
        } catch (e) {
            // do nothing
        }
    }

    const promiseRejection: Exception = {
        type: "PromiseRejection",
        value: stringReason,
    };
    const creationPointStack = (rawEvent.promise as TraceablePromise<unknown>).creationPoint;
    if (creationPointStack != null && typeof creationPointStack === "string") {
        const frames = defaultStackParser(creationPointStack || "", 0);
        if (frames.length) {
            promiseRejection.stacktrace = { frames };
        }
    }

    const event: Event = {
        level: "error",
        source: "onunhandledrejection",
        exception: {
            values: [...promiseErrors, promiseRejection].filter(Boolean),
        },
        gameLoaded: false,
        gameLaunchRawConfig: {},
        gameSlug: "",
        gameVersion: "",
        sdkVersion: "",
        env: "",
    };

    if (window.gameLoadingInfo != null) {
        event.gameLoaded = window.gameLoadingInfo.loaded;
        if (window.gameLoadingInfo.gameLaunchRawConfig != null) {
            event.gameSlug = window.gameLoadingInfo.gameLaunchRawConfig.gameSlug;
            event.gameVersion = window.gameLoadingInfo.gameLaunchRawConfig.gameVersion;
            event.env = window.gameLoadingInfo.gameLaunchRawConfig.projectEnv;
            event.sdkVersion = window.gameLoadingInfo.gameLaunchRawConfig.clientConfig?.sdkVersion;
            event.gameLaunchRawConfig = window.gameLoadingInfo.gameLaunchRawConfig;
        }
    }

    return event;
};

const EventLogger = {
    eventFromException,
    eventFromConsoleErrorMessage,
    eventFromUnhandledRejection,
};

export default EventLogger;
