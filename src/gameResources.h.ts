const resourceUrlSymbol = Symbol.for("resourceUrl");
type ResourceUrlSymbolType = typeof resourceUrlSymbol;
type ResourceUrl<T extends string> = number & { [name in ResourceUrlSymbolType]: T };
const resourceUrlBrand = <T extends string>(n: number) => n as ResourceUrl<T>;


export type GameResourceItem = Record<string, ResourceUrl<"common">>;

export type GameResources = {
    "fonts": GameResourceItem,
    "assets": GameResourceItem,
};

const t = {
    "gameResources":
        {
            "fonts":
                {
                    "InternalPrimaryFontNormalNormal":
                        "https://cdn.test.inappstory.com/np/file/tf/um/dn/tb6yge0jsjph8u6vnnvsdy1cvg.ttf?k=AQAAAAAAAAAC",
                    "InternalPrimaryFontBoldNormal":
                        "https://cdn.test.inappstory.com/np/file/zs/ee/u4/xewee8swl6uop6biaomxsgu9u0.ttf?k=AQAAAAAAAAAC",
                    "InternalPrimaryFontNormalItalic":
                        "https://cdn.test.inappstory.com/np/file/tv/zj/cq/vb51rxqvcintwdj7kpsfedgnug.ttf?k=AQAAAAAAAAAC",
                    "InternalSecondaryFontNormalNormal":
                        "https://cdn.test.inappstory.com/np/file/96/qy/cc/ipmyidzfrxssd4qccyqdwbul4j.ttf?k=AQAAAAAAAAAC",
                    "InternalSecondaryFontBoldNormal":
                        "https://cdn.test.inappstory.com/np/file/dh/uo/ix/4nbuiht7imj0m2afayhukyoh8a.ttf?k=AQAAAAAAAAAC",
                    "InternalSecondaryFontBoldItalic":
                        "https://cdn.test.inappstory.com/np/file/ia/lq/qd/hy2s0vpyh0vgqdnjjm4lfoigss.ttf?k=AQAAAAAAAAAC"
                }
            ,
            "assets":
                {
                    "boardImage":
                        "https://cs.test.inappstory.com/np/file/rk/mi/dx/kgas5ly0bpudunyiw3wuqtvohn.webp?k=AQAAAAAAAAAC",
                    "backgroundImage":
                        "https://cs.test.inappstory.com/np/file/i2/l8/5x/jqxtjth04io7ritifom6hgbtxi.webp?k=AQAAAAAAAAAC"
                }
        }

};
