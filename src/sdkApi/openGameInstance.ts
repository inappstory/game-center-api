import { closeGameReader as sdkCloseGameReader } from "./index";
import { OpenGameInstanceOptions } from "./openGameInstance.h";

export const openGameInstance = (openGameInstance: OpenGameInstanceOptions) => {
    sdkCloseGameReader({ openGameInstance });
};
