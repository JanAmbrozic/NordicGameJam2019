/* eslint-disable*/
/* global _cc */

/**
 * IMPORTANT: Include this library always as a plugin in your Cocos editor.
 * To see how to do that please check: {@link https://docs.cocos2d-x.org/creator/manual/en/scripting/plugin-scripts.html}
 */

/**
 * Overrides Cocos InputManager's _registerKeyboardEvent function in order to not stop propagation on keydown/up events.
 */
// _cc.inputManager._registerKeyboardEvent = function () { // eslint-disable-line no-underscore-dangle
//     cc.game.canvas.addEventListener('keydown', (e) => {
//         cc.systemEvent.dispatchEvent(new cc.Event.EventKeyboard(e.keyCode, true));
//     }, false);
//     cc.game.canvas.addEventListener('keyup', (e) => {
//         cc.systemEvent.dispatchEvent(new cc.Event.EventKeyboard(e.keyCode, false));
//     }, false);
// };

/**
 * Overrides ContainerStrategy._setupContainer with minimal code changes. The only change is the conversion from `Math.min` to `Math.max`.
 * This is very likely a bug on Cocos' side because this code should work as expected - but it does not and on Android and iPhone device
 * (only real devices, simulators and emulators will work fine) we can get very low resolution/graphics rendering.
 *
 * Remove only if you know what you are doing. Or don't, I'm not your mom.
 */
cc.ContainerStrategy.prototype._setupContainer = function(view, w, h) {
    var locCanvas = cc.game.canvas, locContainer = cc.game.container;

    if (!CC_WECHATGAME) {
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            document.body.style.width = (view._isRotated ? h : w) + 'px';
            document.body.style.height = (view._isRotated ? w : h) + 'px';
        }
        // Setup style
        locContainer.style.width = locCanvas.style.width = w + 'px';
        locContainer.style.height = locCanvas.style.height = h + 'px';
    }
    // Setup pixel ratio for retina display
    var devicePixelRatio = view._devicePixelRatio = 1;
    if (view.isRetinaEnabled())
        devicePixelRatio = view._devicePixelRatio = Math.max(2, window.devicePixelRatio || 1);
    // Setup canvas
    locCanvas.width = w * devicePixelRatio;
    locCanvas.height = h * devicePixelRatio;
};

