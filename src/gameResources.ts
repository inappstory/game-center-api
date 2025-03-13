// todo - get fonts arr and other keys

import { gameLaunchConfig } from "./gameLaunchConfig";
import { isAndroid, isIos } from "./env";
import { ResourceInterface } from "./ResourceManager";
import { PlaceholderType } from "./gameLaunchConfig.h";

export class Resource implements ResourceInterface {
    private _cacheUri: string = "";

    constructor(
        private readonly _key: string,
        private readonly _uri: string,
        private readonly _originUri: string,
        private readonly _orderOfFetch: number
    ) {
        this._cacheUri = this._uri;
    }

    get key() {
        return this._key;
    }

    setCacheUri(uri: string): void {
        this._cacheUri = uri;
    }

    getCacheUri(): string {
        return this._cacheUri;
    }

    unsetCacheUri(): void {
        this._cacheUri = this._uri;
    }

    getUri(): string {
        return this._uri;
    }

    getOriginUri(): string {
        return this._originUri;
    }

    getOrderOfFetch(): number {
        return 0;
    }
}

export abstract class ResourceList implements Iterable<ResourceInterface> {
    protected orderOfFetch = 0;

    protected _hashMap: Record<string, Resource> | null = null;

    protected get hashMap() {
        if (this._hashMap === null) {
            const map = this.rawMapGetter();

            this._hashMap = {};

            let src: string;

            for (let key in map) {
                src = map[key];
                this._hashMap[key] = new Resource(key, this.prepareSrc(src, key), this.convertToOriginUri(src), this.orderOfFetch);
            }
        }

        return this._hashMap as Readonly<typeof this._hashMap>;
    }

    constructor() {}

    public getAssetByKey<T>(key: string, defaultValue: T) {
        const resource = this.hashMap[key] ?? null;

        return resource === null ? defaultValue : resource.getCacheUri();
    }

    protected rawMapGetter(): Record<string, string> {
        return {};
    }

    protected prepareSrc(src: string, key: string) {
        return src;
    }

    protected convertToOriginUri(uri: string): string {
        return uri;
    }

    protected onCacheDone() {}

    [Symbol.iterator]() {
        let pointer = 0;
        const resources = Object.values(this.hashMap);

        return {
            next(): IteratorResult<ResourceInterface> {
                if (pointer < resources.length) {
                    return {
                        done: false,
                        value: resources[pointer++],
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

export abstract class StaticResourceList extends ResourceList {
    protected override orderOfFetch = 1;
}

export abstract class DynamicResourceList extends ResourceList {
    protected override orderOfFetch = 2;

    protected override prepareSrc(src: string, key: string) {
        if (isAndroid || isIos) return `./resources_${gameLaunchConfig.gameInstanceId}/${key}`;
        else return src;
    }
}

export class DynamicResourceAssets extends DynamicResourceList {
    protected override rawMapGetter(): Record<string, string> {
        return gameLaunchConfig?.gameResources?.assets ?? {};
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

export class DynamicResourceFonts extends DynamicResourceList {
    protected override rawMapGetter(): Record<string, string> {
        return gameLaunchConfig?.gameResources?.fonts ?? {};
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

export class StaticResourcesImagePlaceholders extends StaticResourceList {
    protected override rawMapGetter(): Record<string, string> {
        let map: Record<string, string> = {};

        for (const placeholder of gameLaunchConfig.clientConfig.placeholders) {
            if (placeholder.type === PlaceholderType.IMAGE) {
                map[placeholder.name] = placeholder.originValue ?? "";
            }
        }

        return map;
    }
}

export const staticResourcesImagePlaceholders = new StaticResourcesImagePlaceholders();
