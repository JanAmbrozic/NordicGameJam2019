const State = cc.Enum({
    FOLLOW: 'stateFollow',
    IDLE: 'stateIdle',
    ATTACKING: 'stateAttacking'
});

cc.Class({
    extends: cc.Component,

    properties: {
        zombieAnim: cc.Animation,
        zombieNode: cc.Node,
        playerNode: cc.Node
    },

    start () {
        this.state = State.IDLE;
        //this.zombieAnim.play('ZombieIdle');
        this.follow();
        this.speed = 500;
    },

    follow() {
        this.state = State.FOLLOW;
        this.zombieAnim.play('ZombieWalk');
    },

    update(dt) {
        if (this.state === State.FOLLOW) {
            this.zombieNode.x += this.speed * dt * this.getDirection();
        }
    },

    getDirection() {
       // console.log(this.playerNode.x, this.zombieNode.x)
       if (this.playerNode.x > this.getZombiePosX() + 100 && this.getZombiePosX() < this.playerNode.x + 100) {
            this.zombieAnim.play('ZombieAttack');
            this.state = State.ATTACKING;
            return this.zombieNode.scaleX;
       } else if (this.playerNode.x > this.getZombiePosX()) {
            this.zombieNode.scaleX = 1;
            return 1;
        } else {
            this.zombieNode.scaleX = -1;
            return -1;
        }
    },

    getZombiePosX() {
        return (this.zombieNode.x * this.node.scale) + (this.zombieNode.width);
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
        this.scheduleOnce( () => {
            this.die();
        }, 2);
    },

    die() {
        if (this.zombieNode.anchorX !== 0) {
            this.zombieNode.anchorX = 0;
            this.zombieNode.x = this.zombieNode.x - (150 * this.zombieNode.scaleX);
        }
        this.zombieAnim.play('ZombieDead');
    },

    idle() {
        if (this.zombieNode.anchorX !== 0) {
            this.zombieNode.anchorX = 0;
            this.zombieNode.x = this.zombieNode.x - (150 * this.zombieNode.scaleX);
        }
        this.zombieAnim.play('ZombieIdle');
    }

    // update (dt) {},
});
