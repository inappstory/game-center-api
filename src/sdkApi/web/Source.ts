class Source {
    constructor() {}

    get sourceWindowOrigin(): string | null {
        if (window.gameLoadingInfo != null && window.gameLoadingInfo.sourceWindowOrigin != null) {
            return window.gameLoadingInfo.sourceWindowOrigin;
        }
        return this._sourceWindowOrigin;
    }

    set sourceWindowOrigin(value: string | null) {
        this._sourceWindowOrigin = value;
    }

    get sourceWindow(): Window | null {
        if (window.gameLoadingInfo != null && window.gameLoadingInfo.sourceWindow != null) {
            return window.gameLoadingInfo.sourceWindow;
        }
        return this._sourceWindow;
    }

    set sourceWindow(value: Window | null) {
        this._sourceWindow = value;
    }

    private _sourceWindow: Window | null = null;
    private _sourceWindowOrigin: string | null = null;
}

export const webSource = new Source();
