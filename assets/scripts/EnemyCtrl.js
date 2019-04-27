const BloodController = require('BloodController');

const State = cc.Enum({
    FOLLOW: 'stateFollow',
    IDLE: 'stateIdle',
    ATTACKING: 'stateAttacking',
    FALLING: 'stateFalling',
    DEAD: 'stateDead'
});

cc.Class({
    extends: cc.Component,

    properties: {
        zombieAnim: cc.Animation,
        zombieNode: cc.Node,
        zombieCollider: cc.Collider,
        zombieMoan: cc.AudioSource,
        zombieIdleAudio: cc.AudioSource
    },

    start () {
        //this.zombieAnim.play('ZombieIdle');
        this.speed = 500;
        this.wiggleRoom = 250;
        this.fallingSpeed = 1000;
        this.playerNode = cc.find('Canvas/CharacterContainer');
        this.zombieIdleAudio.loop = true;
        this.zombieIdleAudio.play();
    },

    onCollisionEnter (collidedNode) {
        console.log(collidedNode.node.name)
        if(collidedNode.node.name === 'swordCollider' || collidedNode.tag === 1) {
            this.die();
        } else if (collidedNode.node.name === 'characterController') {
            this.zombieAnim.play('ZombieAttack');
            this.state = State.ATTACKING;
        }
    },

    follow() {
        this.node.y = -381;
        this.zombieCollider.enabled = true;
        this.state = State.FOLLOW;
        this.zombieAnim.play('ZombieWalk');
    },

    update(dt) {
        if (this.state === State.FOLLOW) {
            this.node.x += this.speed * dt * this.getDirection();
        } else if (this.state === State.FALLING) {
            if (this.node.y > -371) {
                this.node.y -= this.fallingSpeed * dt;
            } else {
                this.follow();
            }
        }
    },

    getDirection() {
        if (this.playerNode.x > this.getZombiePosX()) {
            this.zombieNode.scaleX = 1;
            this.zombieCollider.offset.x = 480;
            return 1;
        } else {
            this.zombieNode.scaleX = -1;
            this.zombieCollider.offset.x = 200;
            return -1;
        }
    },

    getZombiePosX() {
        return (this.node.x + (this.wiggleRoom * this.zombieNode.scaleX * -1));
    },

    walk () {
        this.zombieAnim.play('ZombieWalk');
        var seq = (cc.sequence(
            cc.moveTo(2, {x: - 400, y: 0}),
            cc.callFunc(()=>{
                 this.node.scaleX = -1;
                 this.node.x =  this.node.x + (282 * 2);
            }),
            cc.moveTo(2, {x: 400, y: 0}),
            cc.callFunc(()=>{
                this.node.scaleX = 1;
                this.node.x =  this.node.x - (282 * 2);
                this.zombieAnim.play('ZombieAttack');
            })));

        // create a moving action
        var action = cc.moveTo(2, {x: - 400, y: 0});
        // execute the action
        this.node.runAction(seq);
        // // stop one action
        // node.stopAction(action);
        // // stop all actions
        // node.stopActions();
    },

    onAttackComplete() {
        this.idle();
    },

    setGroundContainer (container) {
        this.groundContainer = container;
    },

    die() {
        if (this.zombieNode.anchorX !== 0) {
            this.zombieNode.anchorX = 0;
            this.zombieNode.x = this.zombieNode.x - (150 * this.zombieNode.scaleX);
        }
        this.node.emit('die');
        this.node.getComponent(BloodController).play(this.groundContainer,
            this.node.x , -this.zombieNode.scaleX)
        this.zombieAnim.play('ZombieDead');
        this.state = State.DEAD;
        this.zombieCollider.enabled = false;
        this.zombieMoan.play();
        this.zombieIdleAudio.stop();
    },

    idle() {
        if (this.zombieNode.anchorX !== 0) {
            this.zombieNode.anchorX = 0;
            this.zombieNode.x = this.zombieNode.x - (150 * this.zombieNode.scaleX);
        }
        this.zombieAnim.play('ZombieIdle');
    },

    fallDown() {
        this.zombieCollider.enabled = false;
        this.zombieAnim.play('ZombieAttack');
        this.state = State.FALLING;
    }
});
