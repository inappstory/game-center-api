// todo - get fonts arr and other keys

import { gameLaunchConfig } from "./gameLaunchConfig";
import { isAndroid, isIos } from "./env";
import { ResourceInterface } from "./ResourceManager";
import { PlaceholderType } from "./gameLaunchConfig.h";

class Asset implements ResourceInterface {
    constructor(
        private readonly _key: string,
        private readonly _originUri: string,
        private readonly _originFallbackUri: string
    ) {
        this._cacheUri = this._originUri;
    }

    get key() {
        return this._key;
    }

    private _cacheUri: string = "";
    setCacheUri(uri: string): void {
        this._cacheUri = uri;
    }

    getCacheUri(): string {
        return this._cacheUri;
    }

    getOriginUri(): string {
        return this._originUri;
    }

    unsetCacheUri(): void {
        this._cacheUri = this._originUri;
    }

    getOriginFallbackUri(): string {
        return this._originFallbackUri;
    }
}

export abstract class Resource implements Iterable<ResourceInterface> {
    constructor(private readonly _onPreloadDoneCb?: () => void) {}

    get assets() {
        // get keys from Asset
        return Object.fromEntries(this.__assets.map(item => [item.key, item.getCacheUri()]));
    }

    getAssetByKey(key: string, defaultValue: any) {
        for (let i = 0; i < this.__assets.length; ++i) {
            if (this.__assets[i].key === key) {
                return this.__assets[i].getCacheUri();
            }
        }
        return defaultValue;
    }

    protected _assets: Array<Asset> | undefined = undefined;

    protected rawMapGetter(): Record<string, string> {
        return {};
    }

    protected get __assets() {
        if (this._assets == null) {
            const map = this.rawMapGetter();
            this._assets = new Array<Asset>();
            for (let key in map) {
                let src = map[key] as unknown as string;
                let fallbackSrc = src;
                const gameInstanceId = gameLaunchConfig.gameInstanceId;
                if (isAndroid || isIos) {
                    src = `./resources_${gameInstanceId}/${key}`;
                }

                this._assets.push(new Asset(key, src, fallbackSrc));
            }
        }
        return this._assets;
    }

    [Symbol.iterator]() {
        let pointer = 0;
        const components = this.__assets;

        return {
            next(): IteratorResult<ResourceInterface> {
                if (pointer < components.length) {
                    return {
                        done: false,
                        value: components[pointer++],
                    };
                } else {
                    return {
                        done: true,
                        value: null,
                    };
                }
            },
        };
    }
}

export abstract class StaticResource extends Resource {
    protected get __assets() {
        if (this._assets == null) {
            const map = this.rawMapGetter();
            this._assets = new Array<Asset>();
            for (let key in map) {
                let src = map[key] as unknown as string;
                this._assets.push(new Asset(key, src, src));
            }
        }
        return this._assets;
    }
}

export abstract class DynamicResource extends Resource {
    protected get __assets() {
        if (this._assets == null) {
            const map = this.rawMapGetter();
            this._assets = new Array<Asset>();
            for (let key in map) {
                let src = map[key] as unknown as string;
                let fallbackSrc = src;
                const gameInstanceId = gameLaunchConfig.gameInstanceId;
                if (isAndroid || isIos) {
                    src = `./resources_${gameInstanceId}/${key}`;
                }

                this._assets.push(new Asset(key, src, fallbackSrc));
            }
        }
        return this._assets;
    }
}

export class DynamicResourceAssets extends DynamicResource {
    protected rawMapGetter(): Record<string, string> {
        return (gameLaunchConfig?.gameResources?.assets ?? {}) as unknown as Record<string, string>;
    }
}

export const dynamicResourceAssets = new DynamicResourceAssets();

export const getDynamicResourceAsset = (key: string, defaultValue: any) => {
    return dynamicResourceAssets.getAssetByKey(key, defaultValue);
};

export enum PrimaryFontVariants {
    NormalNormal = "InternalPrimaryFontNormalNormal",
    BoldNormal = "InternalPrimaryFontBoldNormal",
    NormalItalic = "InternalPrimaryFontNormalItalic",
    BoldItalic = "InternalPrimaryFontBoldItalic",
}

export enum SecondaryFontVariants {
    NormalNormal = "InternalSecondaryFontNormalNormal",
    BoldNormal = "InternalSecondaryFontBoldNormal",
    NormalItalic = "InternalSecondaryFontNormalItalic",
    BoldItalic = "InternalSecondaryFontBoldItalic",
}

export class DynamicResourceFonts extends DynamicResource {
    protected rawMapGetter(): Record<string, string> {
        return (gameLaunchConfig?.gameResources?.fonts ?? {}) as unknown as Record<string, string>;
    }
}

export const dynamicResourceFonts = new DynamicResourceFonts();

export const getDynamicResourceFont = (key: PrimaryFontVariants | SecondaryFontVariants): string | null => {
    return dynamicResourceFonts.getAssetByKey(key, null);
};

export type ProjectFontFamily = {
    fontsCss: string;
    primaryFontFamily: string;
    secondaryFontFamily: string;
};

let projectFontFamilyStylesheet: ProjectFontFamily = null!;

export const getProjectFontFamilyStylesheet = () => {
    if (projectFontFamilyStylesheet != null) {
        return projectFontFamilyStylesheet;
    }

    let primaryFontCss = "";
    let secondaryFontCss = "";

    const primaryFontName = "InternalPrimaryFont";
    const secondaryFontName = "InternalSecondaryFont";

    const InternalPrimaryFontNormalNormal = getDynamicResourceFont(PrimaryFontVariants.NormalNormal);
    if (InternalPrimaryFontNormalNormal != null) {
        primaryFontCss += `
        @font-face {
            font-family: ${primaryFontName};
            src: url("${InternalPrimaryFontNormalNormal}");
            font-weight: normal;
            font-style: normal;
        }
    `;
    }

    const InternalPrimaryFontBoldNormal = getDynamicResourceFont(PrimaryFontVariants.BoldNormal);
    if (InternalPrimaryFontBoldNormal != null) {
        primaryFontCss += `
        @font-face {
            font-family: ${primaryFontName};
            src: url("${InternalPrimaryFontBoldNormal}");
            font-weight: bold;
            font-style: normal;
        }
    `;
    }

    const InternalPrimaryFontNormalItalic = getDynamicResourceFont(PrimaryFontVariants.NormalItalic);
    if (InternalPrimaryFontNormalItalic != null) {
        primaryFontCss += `
        @font-face {
            font-family: ${primaryFontName};
            src: url("${InternalPrimaryFontNormalItalic}");
            font-weight: normal;
            font-style: italic;
        }
    `;
    }

    const InternalPrimaryFontBoldItalic = getDynamicResourceFont(PrimaryFontVariants.BoldItalic);
    if (InternalPrimaryFontBoldItalic != null) {
        primaryFontCss += `
        @font-face {
            font-family: ${primaryFontName};
            src: url("${InternalPrimaryFontBoldItalic}");
            font-weight: bold;
            font-style: italic;
        }
    `;
    }

    const InternalSecondaryFontNormalNormal = getDynamicResourceFont(SecondaryFontVariants.NormalNormal);
    if (InternalSecondaryFontNormalNormal != null) {
        secondaryFontCss += `
        @font-face {
            font-family: ${secondaryFontName};
            src: url("${InternalSecondaryFontNormalNormal}");
            font-weight: normal;
            font-style: normal;
        }
    `;
    }

    const InternalSecondaryFontBoldNormal = getDynamicResourceFont(SecondaryFontVariants.BoldNormal);
    if (InternalSecondaryFontBoldNormal != null) {
        secondaryFontCss += `
        @font-face {
            font-family: ${secondaryFontName};
            src: url("${InternalSecondaryFontBoldNormal}");
            font-weight: bold;
            font-style: normal;
        }
    `;
    }

    const InternalSecondaryFontNormalItalic = getDynamicResourceFont(SecondaryFontVariants.NormalItalic);
    if (InternalSecondaryFontNormalItalic != null) {
        secondaryFontCss += `
        @font-face {
            font-family: ${secondaryFontName};
            src: url("${InternalSecondaryFontNormalItalic}");
            font-weight: normal;
            font-style: italic;
        }
    `;
    }

    const InternalSecondaryFontBoldItalic = getDynamicResourceFont(SecondaryFontVariants.BoldItalic);
    if (InternalSecondaryFontBoldItalic != null) {
        secondaryFontCss += `
        @font-face {
            font-family: ${secondaryFontName};
            src: url("${InternalSecondaryFontBoldItalic}");
            font-weight: bold;
            font-style: italic;
        }
    `;
    }

    const defaultFontFamily = `-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"`;

    const response = {
        fontsCss: primaryFontCss + secondaryFontCss,
        primaryFontFamily: defaultFontFamily,
        secondaryFontFamily: defaultFontFamily,
    };

    if (primaryFontCss.length > 0) {
        response.primaryFontFamily = `${primaryFontName}, ${defaultFontFamily}`;
    }

    if (secondaryFontCss.length > 0) {
        response.secondaryFontFamily = `${secondaryFontName}, ${defaultFontFamily}`;
    }

    projectFontFamilyStylesheet = response;
    return projectFontFamilyStylesheet;
};

export class StaticResourcesImagePlaceholders extends StaticResource {
    protected rawMapGetter(): Record<string, string> {
        let map: Record<string, string> = {};
        for (const placeholder of gameLaunchConfig.clientConfig.placeholders) {
            if (placeholder.type === PlaceholderType.IMAGE) {
                // @ts-ignore
                map[placeholder.name] = placeholder.originValue;
            }
        }
        return map;
    }
}

export const staticResourcesImagePlaceholders = new StaticResourcesImagePlaceholders();
