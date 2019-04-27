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
        swordCollider: cc.Collider,
        animation: cc.Animation
    },

    start () {
        this.isJumping = false;
        this.isRightDirection = true;
        this.hasKnife = false;
        this.hasSword = false;

        this.speed = 1400;
        this.jumpSpeed = 1200;
        this._changeState(State.IDLE);
    },

    onCollisionEnter (other) {
        if (other.node.group === 'Enemy') {
            this.die();
            return;
        }
        switch(other.tag) {
            case 1:
                this._getKnife(other.node);
                break;
            case 2:
                this._getSword(other.node);
                break;
        }
    },

    setDirection (direction) {
        if (this.state === State.DEAD) {
            return;
        }
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
        if (this.state === State.DEAD) {
            return;
        }
        if (this.state === State.IDLE) {
            this._changeState(State.RUN);
        }
    },

    idle () {
        if (this.state === State.DEAD) {
            return;
        }
        this._changeState(State.IDLE);
    },

    die () {
        if (this.state === State.DEAD) {
            return;
        }
        this.node.emit('die');
        this._changeState(State.DEAD);
    },

    jump () {
        if (this.state === State.DEAD) {
            return;
        }
        if (this.isJumping) {
            return;
        }
        this.isJumping = true;
        this.animation.play('jump');
    },

    _attackSword () {
        if (this.state === State.IDLE || this.state === State.RUN) {
            this.isAttack = true;
            this.animation.play('hit');
        }
    },

    attack () {
        if (this.state === State.DEAD) {
            return;
        }
        if (this.isAttack && this.isJumping) {
            return;
        }
        if (this.hasKnife) {
            this._attackKnife();
        } else if (this.hasSword){
            this._attackSword();
        }
    },

    _getKnife (knifeNode) {
        this.knife = knifeNode.getComponent(KnifeController)
        this.knife.node.group = 'Weapon';
        this.knife.container.parent = null;
        this.container.addChild(this.knife.container);
        this.knife.reset();

        this.hasKnife = true;
    },

    _getSword (swordNode) {
        swordNode.destroy();
        this.hasSword = true;
    },

    _attackKnife () {
        if (this.state === State.IDLE || this.state === State.RUN) {
            this.hasKnife = false;
            this.isAttack = true;
            this.animation.play('throw');
        }
    },

    update (dt) {
        if (this.state === State.DEAD) {
            return;
        }
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

    // Callback for knife and sword animation complete
    onAttackComplete () {
        this.isAttack = false;
        this.swordCollider.node.active = false;
        this.swordCollider.enabled = false;
        this._changeState(this.state);
    },

    // Callback when starts the throw frame
    onThrow () {
        this.knife.fly();
    },

    // Callback when starts the sword hit frame
    onSword () {
        this.swordCollider.node.active = true;
        this.swordCollider.enabled = true;
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
