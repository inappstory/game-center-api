// pad('0000000000','123',true);
// '0000000123'
function pad(pad: string, str: string, padLeft: boolean) {
    if (typeof str === "undefined")
        return pad;
    if (str.length >= pad.length)
        return str;
    if (padLeft) {
        return (pad + str).slice(-pad.length);
    } else {
        return (str + pad).substring(0, pad.length);
    }
}

export function base64url_decode(str: string) {
    str = str.replace(new RegExp("-", "g"), "+").replace(new RegExp("_", "g"), "/");
    const length = str.length;
    str = pad(new Array(length % 4).fill("=").join(""), str, false);
    return window.atob(str);
}
