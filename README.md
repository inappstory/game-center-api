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
    GameCenterApi.gameLoadedSdkCallback();
};

const gameStarted = () => {
    setTimeout(() => {
        // Wait for render complete - then remove native loader screen
        GameCenterApi.gameShouldForegroundCallback();
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

## Get Application version

```ts
import GameCenterApi from "@inappstory/game-center-api";

// 1.2.3
const version: string | null = GameCenterApi.getApplicationVersion();
```

## Get Application build version

```ts
import GameCenterApi from "@inappstory/game-center-api";

// 300
const version: number | null = GameCenterApi.getApplicationBuildVersion();
```
