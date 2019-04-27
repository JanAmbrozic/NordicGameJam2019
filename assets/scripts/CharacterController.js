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
        swordCollider: cc.Collider,
        animation: cc.Animation,
        audioSource: cc.AudioSource,
        hiyaAudio: cc.AudioSource
    },

    start () {
        this.isJumping = false;
        this.isRightDirection = true;
        this.knifeAmount = 0;
        this.knivesList = [];
        this.hasSword = true;

        this.screenWidth = cc.view.getVisibleSize().width;
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
        if ( this.state === State.DEAD) {
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
        //this.hiyaAudio.play();
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
        if (this.isAttack || this.isJumping) {
            return;
        }
        if (this.knivesList.length > 0) {
            this._attackKnife();
        } else if (this.hasSword){
            this._attackSword();
        }
    },

    _getKnife (knifeNode) {
        this.knife = knifeNode.getComponent(KnifeController)
        this.knife.node.group = 'Weapon';
        this.knife.container.parent = null;
        this.knife.container.angle = 0;
        this.container.addChild(this.knife.container);
        this.knife.reset();

        this.knivesList.push(this.knife);
        this.node.emit('updateKnife', this.knivesList.length);
    },

    _getSword (swordNode) {
        swordNode.destroy();
        this.hasSword = true;
    },

    _attackKnife () {
        if (this.state === State.IDLE || this.state === State.RUN) {
            this.knife = this.knivesList.shift();
            this.node.emit('updateKnife', this.knivesList.length);
            this.isAttack = true;
            this.animation.play('throw');
            this.hiyaAudio.play();
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
            if (this.container.x < -this.container.width - this.screenWidth / 2) {
                this.container.x += this.screenWidth;
            } else if (this.container.x > this.screenWidth / 2 + this.container.width) {
                this.container.x -= this.screenWidth;
            }
        }

    },

    onJumpComplete () {
        this.isJumping = false;
        if (this.state === State.DEAD) {
            this.animation.play('dead');
        } else {
            this._changeState(this.state)
        }
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
        const position = this.knife.container.parent.convertToWorldSpaceAR(this.knife.container.position);

        this.knife.container.position = this.container.parent.convertToNodeSpaceAR(position);
        this.knife.container.parent = null;
        this.container.parent.addChild(this.knife.container);
        this.knife.fly(this.isRightDirection);
    },

    // Callback when starts the sword hit frame
    onSword () {
        this.swordCollider.node.active = true;
        this.swordCollider.enabled = true;
        this.audioSource.play();
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
                if (!this.isJumping) {
                    this.animation.play('dead');
                }
                break;
        }
    }
});
