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

    fly (direction) {
        if (this.state === State.FLY) {
            return;
        }
        this.container.active = true;
        this.state = State.FLY;
        this.container.scaleX = direction ? 1 : -1;
    },

    update (dt) {
        if (this.state === State.FLY) {
            this.container.x += dt * this.speed * this.container.scaleX;
        }
    }
});
