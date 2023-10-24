// todo - get fonts arr and other keys

import {gameLaunchConfig} from "./gameLaunchConfig";
import {isAndroid, isIos} from "./env";

export const getDynamicResourceAsset = (key: string, defaultValue: any) => {
    const gameInstanceId = gameLaunchConfig.gameInstanceId;
    const assets = gameLaunchConfig?.gameResources?.assets ?? {};

    if (assets[key] != null) {
        if (isAndroid || isIos) {
            return `./resources_${gameInstanceId}/${key}`;
        } else {
            return assets[key]; // url
        }
    }
    return defaultValue;
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

export const getDynamicResourceFont = (key: PrimaryFontVariants | SecondaryFontVariants): string | null => {
    const gameInstanceId = gameLaunchConfig.gameInstanceId;
    const fonts = gameLaunchConfig?.gameResources?.fonts ?? {};

    if (fonts[key] != null) {
        if (isAndroid || isIos) {
            return `./resources_${gameInstanceId}/${key}`;
        } else {
            return fonts[key] as unknown as string;
        }
    }
    return null;
};

export type ProjectFontFamily = {
    fontsCss: string,
    primaryFontFamily: string,
    secondaryFontFamily: string,
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
