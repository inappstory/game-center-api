import { isIos } from "../env";
import { logError } from "../errorHandler";

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API
 * accept 200 | [200, 100, 200] | null | 0, [0]
 *
 * @param duration
 * @param fallbackStyle
 */
export const vibrate = (
    duration: number | Array<number> | null,
    fallbackStyle?: "impactLight" | "impactMedium" | "impactHeavy" | "selection" | "notificationSuccess" | "notificationWarning" | "notificationError"
) => {
    var allowedFallback = ["impactLight", "impactMedium", "impactHeavy", "selection", "notificationSuccess", "notificationWarning", "notificationError"];

    let pattern: Array<unknown> = [];
    if (!Array.isArray(duration)) {
        if (duration == null || duration == 0) {
            // send empty array to sdk
            // Calling Navigator.vibrate() with a value of 0, an empty array, or an array containing all zeros will cancel any currently ongoing vibration pattern.
        } else {
            pattern.push(duration);
        }
    } else {
        if (duration.filter(Boolean).length === 0) {
            // send empty array to sdk
            // Calling Navigator.vibrate() with a value of 0, an empty array, or an array containing all zeros will cancel any currently ongoing vibration pattern.
        } else {
            pattern = duration;
        }
    }
    const patternResult: Array<number> = pattern.map(_ => parseInt(_ as string));

    // if IS_MOBILE
    if (isIos) {
        if (fallbackStyle == null || allowedFallback.indexOf(fallbackStyle) === -1) {
            //@ts-ignore
            fallbackStyle = allowedFallback[0];
        }

        if (window.webkit.messageHandlers.haptic && window.webkit.messageHandlers.haptic.postMessage) {
            window.webkit.messageHandlers.haptic.postMessage(
                JSON.stringify({
                    pattern: pattern,
                    fallbackStyle: fallbackStyle,
                    enableVibrateFallback: false,
                })
            );
        }

        // @deprecated
        // if (window.webkit.messageHandlers.vibrate !== undefined) {
        //     window.webkit.messageHandlers.vibrate.postMessage(JSON.stringify(patternResult));
        // }
    } else {
        if (window.Android && window.Android.vibrate != null) {
            try {
                window.Android.vibrate(patternResult);
            } catch (e) {
                logError(e);
            }
        } else {
            try {
                navigator.vibrate(patternResult);
            } catch (e) {
                logError(e);
            }
        }
    }
};
