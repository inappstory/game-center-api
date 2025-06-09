export const Clipboard = (function (window, document, navigator) {
    let textArea: HTMLTextAreaElement | null = null,
        copy;

    function isOS() {
        return navigator.userAgent.match(/ipad|iphone/i);
    }

    function createTextArea(text: string) {
        textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
    }

    function selectText() {
        if (textArea) {
            if (isOS()) {
                const range = document.createRange();
                range.selectNodeContents(textArea);
                const selection = window.getSelection();
                if (selection) {
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
                textArea.setSelectionRange(0, 999999);
            } else {
                textArea.select();
            }
        }
    }

    function copyToClipboard() {
        document.execCommand("copy");
        textArea && document.body.removeChild(textArea);
    }

    copy = function (text: string) {
        createTextArea(text);
        selectText();
        copyToClipboard();
    };

    return {
        copy: copy,
    };
})(window, document, navigator);
