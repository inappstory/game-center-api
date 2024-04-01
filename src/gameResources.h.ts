const resourceUrlSymbol = Symbol.for("resourceUrl");
type ResourceUrlSymbolType = typeof resourceUrlSymbol;
type ResourceUrl<T extends string> = number & { [name in ResourceUrlSymbolType]: T };
const resourceUrlBrand = <T extends string>(n: number) => n as ResourceUrl<T>;

export type GameResourceItem = Record<string, ResourceUrl<"common">>;

export type GameResources = {
    fonts: GameResourceItem;
    assets: GameResourceItem;
};
