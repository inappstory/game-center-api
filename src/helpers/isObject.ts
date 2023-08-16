export function isObject (item: any) {
    return (typeof item === "object" && !Array.isArray(item) && item != null);
}
