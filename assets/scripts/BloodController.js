const State = cc.Enum({
    NONE: 'none',
    PLAY: 'play'
})

cc.Class({
    extends: cc.Component,

    properties: {
        minY: -10,
        gravity: 1000,
        bloodDropPrefab: cc.Prefab
    },

    start () {
        this.bloodDrops = [];
        this.count = 10;
        for (let i = 0; i < 10; i++) {
            const blood = cc.instantiate(this.bloodDropPrefab);

            this.bloodDrops.push(blood)
        }
    },

    play (container, posX, isRightDirection) {
        this.isRightDirection = isRightDirection;
        for (let i = 0; i < 10; i++) {
            this.bloodDrops[i].parent = container;
            this.bloodDrops[i].setPosition(posX, 70);
            this.bloodDrops[i].speed = new cc.Vec2(400 + Math.random() * 50, 200 + Math.random() * 50);
        }
        this.state = State.PLAY;
    },

    update (dt) {
        if (this.state === State.PLAY) {
            for (let i = 0; i < 10; i++) {
                if (!this.bloodDrops[i]) {
                    continue;
                }
                this.bloodDrops[i].x += this.bloodDrops[i].speed.x * dt * this.isRightDirection;
                this.bloodDrops[i].y += this.bloodDrops[i].speed.y * dt;
                this.bloodDrops[i].speed.y -= this.gravity * dt;
                if (this.bloodDrops[i].y < this.minY) {
                    this.bloodDrops[i] = null;
                    this.count --;
                }
            }
            if (this.count === 0) {
                this.state = State.NONE;
            }
        }
    },
});
