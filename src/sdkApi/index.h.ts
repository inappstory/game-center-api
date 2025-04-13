import { Placeholder } from "../gameLaunchConfig.h";

export type SdkApiCallbacks = Partial<{
    mounted: () => Promise<void>;
    beforeUnmount: () => void;
    onSdkCloseGameReaderIntent: () => void; // for instance - click on GameReader backdrop on Tablet or Desktop
    onPause: () => void;
    onResume: () => void;
    onBackGesture: () => void;
    onAudioFocusChange: (focusChange: number) => void;
    filterPlaceholders: (placeholders: Placeholder[]) => Placeholder[];
    gameShouldForeground: () => void;
}>;
