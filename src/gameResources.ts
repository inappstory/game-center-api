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

export const getProjectFontFamilyStylesheet = (primaryFontName = "InternalPrimaryFont", secondaryFontName = "InternalSecondaryFont", defaultFontStack: Array<string> = [
    "system-ui",
    // Safari for OS X and iOS (San Francisco)
    "-apple-system",
    // Chrome < 56 for OS X (San Francisco)
    "BlinkMacSystemFont",
    // Windows
    `"Segoe UI"`,
    // Android
    `"Roboto"`,
    // Basic web fallback
    `"Helvetica Neue"`, "Arial", "sans-serif",
    // Emoji fonts
    `"Apple Color Emoji"`, `"Segoe UI Emoji"`, `"Segoe UI Symbol"`
]) => {
    let css = "";
    const defaultFontStackAsString = defaultFontStack.reduce(
        (acc, font, index, fonts) => acc + `local(${font})${(index + 1) < fonts.length ? ", " : ""}`, ""
    );


    // console.log("gameLaunchConfig?.gameResources", gameLaunchConfig?.gameResources);


    const defaultRegular = `local(".SFNS-Regular"), local(".SFNSText-Regular"), local(".HelveticaNeueDeskInterface-Regular"), local(".LucidaGrandeUI"), local("Segoe UI"), local("Ubuntu"), local("Roboto-Regular"), local("DroidSans"), local("Tahoma")`;
    const defaultRegularItalic = `local(".SFNS-Italic"), local(".SFNSText-Italic"), local(".HelveticaNeueDeskInterface-Italic"), local(".LucidaGrandeUI"), local("Segoe UI Italic"), local("Ubuntu Italic"), local("Roboto-Italic"), local("DroidSans"), local("Tahoma")`;
    const defaultBold = `local(".SFNS-Bold"), local(".SFNSText-Bold"), local(".HelveticaNeueDeskInterface-Bold"), local(".LucidaGrandeUI"), local("Segoe UI Bold"), local("Ubuntu Bold"), local("Roboto-Bold"), local("DroidSans-Bold"), local("Tahoma Bold")`;
    const defaultBoldItalic = `local(".SFNS-BoldItalic"), local(".SFNSText-BoldItalic"), local(".HelveticaNeueDeskInterface-BoldItalic"), local(".LucidaGrandeUI"), local("Segoe UI Bold Italic"), local("Ubuntu Bold Italic"), local("Roboto-BoldItalic"), local("DroidSans-Bold"), local("Tahoma Bold")`;
    //
    // css += `
    //     @font-face {
    //         font-family: ${primaryFontName};
    //         src: local("Segoe UI"), local(Roboto), local("Helvetica Neue"), local(Arial), local(sans-serif), local("Apple Color Emoji"), local("Segoe UI Emoji"), local("Segoe UI Symbol"), local(-apple-system), local(BlinkMacSystemFont);
    //     }
    // `;
    //
    // css += `
    //     @font-face {
    //         font-family: ${secondaryFontName};
    //         src: local("Segoe UI"), local(Roboto), local("Helvetica Neue"), local(Arial), local(sans-serif), local("Apple Color Emoji"), local("Segoe UI Emoji"), local("Segoe UI Symbol"), local(-apple-system), local(BlinkMacSystemFont);
    //     }
    // `;


    const InternalPrimaryFontNormalNormal = getDynamicResourceFont(PrimaryFontVariants.NormalNormal);
    css += `
    @font-face {
        font-family: ${primaryFontName};
        src: ${InternalPrimaryFontNormalNormal != null ? `url("${InternalPrimaryFontNormalNormal}"), ` : ""}${defaultRegular};
        font-weight: normal;
        font-style: normal;
    }
    `;

    const InternalPrimaryFontBoldNormal = getDynamicResourceFont(PrimaryFontVariants.BoldNormal);
    css += `
    @font-face {
        font-family: ${primaryFontName};
        src: ${InternalPrimaryFontBoldNormal != null ? `url("${InternalPrimaryFontBoldNormal}"), ` : ""}${defaultBold};
        font-weight: bold;
        font-style: normal;
    }
    `;

    const InternalPrimaryFontNormalItalic = getDynamicResourceFont(PrimaryFontVariants.NormalItalic);
    css += `
    @font-face {
        font-family: ${primaryFontName};
        src: ${InternalPrimaryFontNormalItalic != null ? `url("${InternalPrimaryFontNormalItalic}"), ` : ""}${defaultRegularItalic};
        font-weight: normal;
        font-style: italic;
    }
    `;

    const InternalPrimaryFontBoldItalic = getDynamicResourceFont(PrimaryFontVariants.BoldItalic);
    css += `
    @font-face {
        font-family: ${primaryFontName};
        src: ${InternalPrimaryFontBoldItalic != null ? `url("${InternalPrimaryFontBoldItalic}"), ` : ""}${defaultBoldItalic};
        font-weight: bold;
        font-style: italic;
    }
    `;



    const InternalSecondaryFontNormalNormal = getDynamicResourceFont(SecondaryFontVariants.NormalNormal);
    css += `
    @font-face {
        font-family: ${secondaryFontName};
        src: ${InternalSecondaryFontNormalNormal != null ? `url("${InternalSecondaryFontNormalNormal}"), ` : ""}${defaultRegular};
        font-weight: normal;
        font-style: normal;
    }
    `;

    const InternalSecondaryFontBoldNormal = getDynamicResourceFont(SecondaryFontVariants.BoldNormal);
    css += `
    @font-face {
        font-family: ${secondaryFontName};
        src: ${InternalSecondaryFontBoldNormal != null ? `url("${InternalSecondaryFontBoldNormal}"), ` : ""}${defaultBold};
        font-weight: bold;
        font-style: normal;
    }
    `;

    const InternalSecondaryFontNormalItalic = getDynamicResourceFont(SecondaryFontVariants.NormalItalic);
    css += `
    @font-face {
        font-family: ${secondaryFontName};
        src: ${InternalSecondaryFontNormalItalic != null ? `url("${InternalSecondaryFontNormalItalic}"), ` : ""}${defaultRegularItalic};
        font-weight: normal;
        font-style: italic;
    }
    `;

    const InternalSecondaryFontBoldItalic = getDynamicResourceFont(SecondaryFontVariants.BoldItalic);
    css += `
    @font-face {
        font-family: ${secondaryFontName};
        src: ${InternalSecondaryFontBoldItalic != null ? `url("${InternalSecondaryFontBoldItalic}"), ` : ""}${defaultBoldItalic};
        font-weight: bold;
        font-style: italic;
    }
    `;

    return css;

};
