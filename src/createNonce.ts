// const n=document.querySelector('[nonce]');

export const createNonce = (nonce: string) => {
    console.log("call createNonce", nonce)
    // @ts-ignore
    __webpack_nonce__ = nonce;
}
