export const logError = (e: unknown): void => {
    const error = e as Error;
    const message = {
        type: "error",
        errorName: error.name ?? "",
        message: error.message ?? "",
        stack: error.stack ?? "",
        cause: error.cause ?? "",
        // @ts-ignore Non-standard: This feature is non-standard and is not on a standards track. Do not use it on production sites facing the Web: it will not work for every user. There may also be large incompatibilities between implementations and the behavior may change in the future.
        fileName: error.fileName ?? "",
        // @ts-ignore Non-standard: This feature is non-standard and is not on a standards track. Do not use it on production sites facing the Web: it will not work for every user. There may also be large incompatibilities between implementations and the behavior may change in the future.
        lineNumber: error.lineNumber ?? "",
        // @ts-ignore Non-standard: This feature is non-standard and is not on a standards track. Do not use it on production sites facing the Web: it will not work for every user. There may also be large incompatibilities between implementations and the behavior may change in the future.
        columnNumber: error.columnNumber ?? "",
    };
    // will be handled via sdk console.error override
    console.error(message);
};
