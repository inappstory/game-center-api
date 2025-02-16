/**
 * for call instead of console.error(err)
 * this method collect Error stack to error logger
 **/
export const logError = (e: unknown, cause?: any): void => {
    let error: Error | null = null;

    if (e instanceof Error) {
        error = e as Error;
    }

    if (typeof e === "string") {
        error = new Error(e);
    }

    if (error !== null) {
        const message = {
            type: "error",
            errorName: error.name ?? "",
            message: error.message ?? "",
            stack: error.stack ?? "",
            cause: eventFromError(cause ?? error.cause ?? ""),
            // @ts-ignore Non-standard: This feature is non-standard and is not on a standards track. Do not use it on production sites facing the Web: it will not work for every user. There may also be large incompatibilities between implementations and the behavior may change in the future.
            fileName: error.fileName ?? "",
            // @ts-ignore Non-standard: This feature is non-standard and is not on a standards track. Do not use it on production sites facing the Web: it will not work for every user. There may also be large incompatibilities between implementations and the behavior may change in the future.
            lineNumber: error.lineNumber ?? "",
            // @ts-ignore Non-standard: This feature is non-standard and is not on a standards track. Do not use it on production sites facing the Web: it will not work for every user. There may also be large incompatibilities between implementations and the behavior may change in the future.
            columnNumber: error.columnNumber ?? "",
        };
        // will be handled via sdk console.error override
        console.error(message);
    } else {
        console.error(e);
    }
};

var eventFromError = function (error: unknown) {
    if (error instanceof Error) {
        var data = {
            name: error.name,
            message: error.message,
            stack: error.stack,
        };
        if (error.cause != null) {
            if (error.cause instanceof Error) {
                // @ts-ignore
                data.cause = eventFromError(error.cause);
            } else {
                // @ts-ignore
                data.cause = error.cause;
            }
        }
        return data;
    }
    return error;
};
