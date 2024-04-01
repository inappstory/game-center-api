export type SdkApiCallbacks = {
    mounted: () => void;
    beforeUnmount: () => void;
    onSdkCloseGameReaderIntent: () => void; // for instance - click on GameReader backdrop on Tablet or Desktop
    onPause: () => void;
    onResume: () => void;
    onBackGesture: () => void;
    onAudioFocusChange: (focusChange: number) => void;
};
