import { type CloseGameReaderOptions } from ".";

export type OpenUrlOptions = {
    url: string;
    closeGameReader?: boolean;
    closeGameReaderPayload?: CloseGameReaderOptions;
};
