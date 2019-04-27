const State = cc.Enum({
    IDLE: 'idle',
    FLY: 'fly'
});

cc.Class({
    extends: cc.Component,

    properties: {
        container: cc.Node
    },

    onCollisionEnter (other) {
        this.state = State.IDLE;
        if (other.tag !== 3) {
            this.reset();
        }
    },

    start () {
        this.speed = 2000;
    },

    reset () {
        this.container.setPosition(70, 70);
        this.container.active = false;
    },

    fly () {
        if (this.state === State.FLY) {
            return;
        }
        this.container.active = true;
        this.state = State.FLY;
    },

    update (dt) {
        if (this.state === State.FLY) {
            this.container.x += dt * this.speed;
        }
    }
});
