# game-center-api

API for integration with GameReader (WebView) inside native apps

[Usage example](https://github.com/inappstory/game-center-integration-example)

## Init API

```tsx
import { createSdkApi } from "@inappstory/game-center-api";

const mounted = () => {
    // ready to render UI
    const rootElement = document.getElementById("root");
    const root = createRoot(rootElement!);
    root.render(<App />);
};

createSdkApi({
    mounted,
    beforeUnmount: () => {
        /* Stop AudioContext for instance */
    },
    onPause: () => {
        /* Call on focus lost. Stop game timers for instance */
    },
    onResume: () => {
        /* Call on focus return. Resume game timers for instance */
    },
    onBackGesture: () => {
        /* Call on Android back gesture */
    },
});
```

## Game first render

```tsx
// calling gameLoadedSdkCallback removes the loading screen
import { gameLoadedSdkCallback } from "@inappstory/game-center-api";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement!);
root.render(<AppWithCallbackAfterRender cb={() => gameLoadedSdkCallback()} />);
```
