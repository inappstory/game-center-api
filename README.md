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
    gameShouldForeground: () => {
        /* splash animation finished, now we can start bg music and etc */
    },
});
```

## Game first render

```tsx
const gameLoaded = () => {
    if (GameCenterApi.isSdkSupportGameShouldForegroundCallback()) {
        GameCenterApi.gameLoadedSdkCallback();
    } else {
        // fallback for old sdk versions
        gameShouldForeground();
    }
};

const gameStarted = () => {
    setTimeout(() => {
        // Wait for render complete - then remove native loader screen
        if (GameCenterApi.isSdkSupportGameShouldForegroundCallback()) {
            GameCenterApi.gameShouldForegroundCallback();
        } else {
            GameCenterApi.gameLoadedSdkCallback();
        }
    }, 50);
};

const gameShouldForeground = () => {
    // splash animation finished, now we can start bg music and etc
    gameStarted();
};

// calling gameLoadedSdkCallback removes the loading screen
import { gameLoadedSdkCallback } from "@inappstory/game-center-api";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement!);
root.render(<AppWithCallbackAfterRender cb={gameLoaded} />);
```

## Get user ID

```ts
import GameCenterApi from "@inappstory/game-center-api";
// call only after mounted event (from GameCenterApi.createSdkApi
const getUserId = () => GameCenterApi.gameLaunchConfig.clientConfig.userId;
```

## Get placeholder

```ts
import GameCenterApi, { type PlaceholderType, Placeholder } from "@inappstory/game-center-api";
// call only after mounted event (from GameCenterApi.createSdkApi
const getPlaceholder = (name: string, type: PlaceholderType): Placeholder | undefined => {
    return GameCenterApi.gameLaunchConfig.clientConfig.placeholders.find(placeholder => placeholder.name === name && placeholder.type === type);
};

const avatarUrl = getPlaceholder("avatar", PlaceholderType.IMAGE);
```

## Open url

```ts
import GameCenterApi from "@inappstory/game-center-api";

// closeGameReader - close or not GameReader
const openUrl = (url: string) => GameCenterApi.openUrl({ url, closeGameReader: true });
```

## Close game

```ts
import GameCenterApi from "@inappstory/game-center-api";

const closeGame = () => GameCenterApi.closeGameReader();
```
