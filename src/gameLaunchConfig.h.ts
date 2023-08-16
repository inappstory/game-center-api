import {GameResources} from "./gameResources.h";

export type GameLaunchConfig = {
    gameInstanceId: number,
    gameResources: GameResources,
    projectSlug: string,
    demoMode: boolean,
    projectEnv: "test" | "prod",
    gameDomain: string,
    gameSlug: string,
    gameVersion: string,
    verbose: boolean,
    clientConfig: {
        apiBaseUrl: string,
        apiKey: string,
        appPackageId: string,
        deviceId: string,
        fullScreen: boolean,
        lang: string,
        placeholders: Array<{name: string, type: "text" | "image", value: string}>,
        safeAreaInsets: {
            bottom: number,
            left: number,
            right: number,
            top: number
        },
        screenOrientation: "portrait" | "landscape",
        sdkVersion: string,
        sessionId: string,
        userAgent: string
    },
};


const t = {
    "gameInstanceId": 29,
    "gameResources": {
        "fonts": {
            "InternalPrimaryFontNormalNormal": "https://cdn.test.inappstory.com/np/file/tf/um/dn/tb6yge0jsjph8u6vnnvsdy1cvg.ttf?k=AQAAAAAAAAAC",
            "InternalPrimaryFontBoldNormal": "https://cdn.test.inappstory.com/np/file/zs/ee/u4/xewee8swl6uop6biaomxsgu9u0.ttf?k=AQAAAAAAAAAC",
            "InternalPrimaryFontNormalItalic": "https://cdn.test.inappstory.com/np/file/tv/zj/cq/vb51rxqvcintwdj7kpsfedgnug.ttf?k=AQAAAAAAAAAC",
            "InternalSecondaryFontNormalNormal": "https://cdn.test.inappstory.com/np/file/96/qy/cc/ipmyidzfrxssd4qccyqdwbul4j.ttf?k=AQAAAAAAAAAC",
            "InternalSecondaryFontBoldNormal": "https://cdn.test.inappstory.com/np/file/dh/uo/ix/4nbuiht7imj0m2afayhukyoh8a.ttf?k=AQAAAAAAAAAC",
            "InternalSecondaryFontBoldItalic": "https://cdn.test.inappstory.com/np/file/ia/lq/qd/hy2s0vpyh0vgqdnjjm4lfoigss.ttf?k=AQAAAAAAAAAC"
        },
        "assets": {
            "boardImage": "https://cs.test.inappstory.com/np/file/rk/mi/dx/kgas5ly0bpudunyiw3wuqtvohn.webp?k=AQAAAAAAAAAC",
            "backgroundImage": "https://cs.test.inappstory.com/np/file/i2/l8/5x/jqxtjth04io7ritifom6hgbtxi.webp?k=AQAAAAAAAAAC"
        }
    },
    "storyId": null,
    "elementId": null,
    "projectSlug": "test",
    "demoMode": false,
    "projectEnv": "test",
    "gameDomain": "https://games.test.inappstory.com/fifteen-puzzle/1.1.0/build/",
    "gameSlug": "fifteen-puzzle",
    "gameVersion": "1.1.0",
    "clientConfig": {
        "apiBaseUrl": "https://api.test.inappstory.ru/",
        "apiKey": "BAEAAAAAAAAANsjZZBYaIThgDx0GIhFYKhdBRhlHFCMoYAkNIm3xDBr2ypZlqafCVsD8EbDWbkyq6HK8GiaPLeadSWY",
        "appPackageId": "com.inappstory.android",
        "deviceId": "293f420fc39908d1",
        "fullScreen": false,
        "gameInstanceId": "29",
        "lang": "ru-RU",
        "placeholders": [
            {
                "name": "sadsad",
                "type": "text",
                "value": "2222222222222222"
            },
            {
                "name": "oooooooooooo",
                "type": "text",
                "value": "ooooooooooo"
            },
            {
                "name": "rrrrrrrrrrr",
                "type": "text",
                "value": "rrrrrrrrrrrrr"
            },
            {
                "name": "zvukomania_username",
                "type": "text",
                "value": "Default username"
            },
            {
                "name": "pppppppppp",
                "type": "text",
                "value": "pppppppppppp"
            },
            {
                "name": "tttttttttt",
                "type": "text",
                "value": "ttttttttttttt"
            },
            {
                "name": "iiiiiiiiiiiiiiii",
                "type": "text",
                "value": "iiiiiiiiiiiiiiiiii"
            },
            {
                "name": "qqqq",
                "type": "text",
                "value": "qqqqqq"
            },
            {
                "name": "uuuuuuuuuuuuu",
                "type": "text",
                "value": "uuuuuuuuuuuuuuuu"
            },
            {
                "name": "wwwwww",
                "type": "text",
                "value": "wwwwwwwwwww"
            },
            {
                "name": "aaaaaaaaaaaaa",
                "type": "text",
                "value": "aaaaaaaaaaaaaaaa"
            },
            {
                "name": "eeeeee",
                "type": "text",
                "value": "eeeeeeeeeeee"
            },
            {
                "name": "username",
                "type": "text",
                "value": "default username'000"
            },
            {
                "name": "zvukomania_avatar",
                "type": "image",
                "value": "https://i1.sndcdn.com/avatars-000102655488-sr66dh-t500x500.jpg"
            },
            {
                "name": "avatar",
                "type": "image",
                "value": "https://i1.sndcdn.com/avatars-000102655488-sr66dh-t500x500.jpg"
            },
            {
                "name": "img1",
                "type": "image",
                "value": "https://snob.ru/indoc/original_images/8f4/glavnai"
            }
        ],
        "safeAreaInsets": {
            "bottom": 16,
            "left": 0,
            "right": 0,
            "top": 0
        },
        "screenOrientation": "portrait",
        "sdkVersion": "1.16.0",
        "sessionId": "A2glAAAAAAAAAQAAAKTI2WQCCQgAAAAamGs7wP4RcYiEwdMi19Z7aE68fT6QW5S18Oe812f6pw",
        "userAgent": "InAppStorySDK/750 Dalvik/2.1.0 (Linux; U; Android 11; XQ-AT51 Build/58.1.A.5.530) Application/258 (com.inappstory.android 3.1.0)"
    },
    "test": "Special' string\" \\b \n \r \t \t / \\",
    "storyLocalData": {}
};
