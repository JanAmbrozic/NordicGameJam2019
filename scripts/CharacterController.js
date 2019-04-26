const KnifeController = require('KnifeController');

const State = cc.Enum({
    RUN: 'run',
    IDLE: 'idle',
    DEAD: 'dead'
});

cc.Class({
    extends: cc.Component,

    properties: {
        container: cc.Node,
        characterSprite: cc.Sprite,
        knife: KnifeController,
        animation: cc.Animation
    },

    onCollision () {

    },

    start () {
        this.isJumping = false;
        this.isRightDirection = true;
        this.hasKnife = false;
        this.hasSword = true;

        this.speed = 1400;
        this.jumpSpeed = 700;
        this._changeState(State.IDLE);
    },

    setDirection (direction) {
        if (this.isRightDirection === direction) {
            return;
        }
        this.isRightDirection = direction;
        if (!this.isRightDirection) {
            this.container.scaleX = -1;
        } else {
            this.container.scaleX = 1;
        }
    },

    run () {
        if (this.state === State.IDLE) {
            this._changeState(State.RUN);
        }
    },

    idle () {
        this._changeState(State.IDLE);
    },

    jump () {
        if (this.isJumping) {
            return;
        }
        this.isJumping = true;
        this.animation.play('jump');
    },

    attackSword () {
        this.isAttack = true;
        if (this.hasSword && (this.state === State.IDLE || this.state === State.RUN)) {
            this.animation.play('hit');
        }
    },

    attack () {
        this.attackKnife();
        this.attackSword();
    },

    getKnife () {
        this.hasKnife = true;
    },

    getSword () {
        this.hasSword = true;
    },

    attackKnife () {
        if (this.hasKnife && (this.state === State.IDLE || this.state === State.RUN)) {
            this.animation.play('throw');
            this.knife.fly(this.isRightDirection);
        }
    },

    update (dt) {
        if (this.state === State.RUN && !this.isAttack) {
            if (this.isJumping) {
                this.container.x += dt * this.jumpSpeed * this.container.scaleX;
            } else {
                this.container.x += dt * this.speed * this.container.scaleX;
            }
        }

    },

    onJumpComplete () {
        this.isJumping = false;
        this._changeState(this.state)
    },

    onAttackComplete () {
        this.isAttack = false;
        this._changeState(this.state)
    },

    _changeState (state) {
        this.state = state;
        switch (state) {
            case State.RUN:
                if (!this.isJumping && !this.isAttack) {
                    this.animation.play('run');
                }
                break;
            case State.IDLE:
                if (!this.isJumping && !this.isAttack) {
                    this.animation.play('idle');
                }
                break;
            case State.DEAD:
                this.animation.play('dead');
                break;
        }
    }
});
