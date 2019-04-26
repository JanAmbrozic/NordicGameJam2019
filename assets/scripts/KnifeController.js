const State = cc.Enum({
    IDLE: 'idle',
    FLY: 'jump'
});

cc.Class({
    extends: cc.Component,

    properties: {
    },

    onCollision () {

    },

    start () {

    },

    fly (direction) {
    },

    _changeState (state) {
        if (this.state === state) {
            return;
        }
        this.state === state;
        switch (state) {
            case State.FLY:
                break;
            case State.IDLE:
                break;
        }
    },

    update (dt) {

    }
});
