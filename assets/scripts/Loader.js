cc.Class({
    extends: cc.Component,

    properties: {
    },

    nextScene () {
        cc.director.loadScene('Game');
    }
});
