const CharacterController = require('CharacterController');
const EnemyController = require('EnemyCtrl');

cc.Class({
    extends: cc.Component,

    properties: {
        scoreLabel: cc.Label,
        knivesLabel: cc.Label,
        characterController: CharacterController,
        zombieContainer: cc.Node,
        itemsContainer: cc.Node,
        zombiePrefab: cc.Prefab,
        knifePrefab: cc.Prefab,
        swordPrefab: cc.Prefab,
        gameNode: cc.Node,
        animation: cc.Animation
    },

    start () {
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;

        this._pressedKeyMap = new Map();
        // add key down and key up event
        this.onKeyDownCallback = (event) => this.onKeyDown(event);
        this.onKeyUpCallback = (event) => this.onKeyUp(event);
        cc.game.canvas.addEventListener(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDownCallback);
        cc.game.canvas.addEventListener(cc.SystemEvent.EventType.KEY_UP, this.onKeyUpCallback);

        this.score = 0;
        this.createKnife();

        this.characterController.node.on('die', () => {
            this.restart();
        });
        this.characterController.node.on('updateKnife', (knifeAmount) => {
            this.increaseKnives(knifeAmount);
        });
    },

    onGameStart () {
        this.createEnemy();
    },

    onDestroy () {
        cc.game.canvas.removeEventListener(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDownCallback);
        cc.game.canvas.removeEventListener(cc.SystemEvent.EventType.KEY_UP, this.onKeyUpCallback);
    },

    onKeyDown (event) {
        switch(event.keyCode) {
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
                if (this._pressedKeyMap.get("LEFT")) {
                    return;
                }
                this._pressedKeyMap.set("LEFT", true);
                this.characterController.setDirection(false);
                this.characterController.run();
                break;
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                if (this._pressedKeyMap.get("RIGHT")) {
                    return;
                }
                this._pressedKeyMap.set("RIGHT", true);
                this.characterController.setDirection(true);
                this.characterController.run();
                break;
            case cc.macro.KEY.w:
            case cc.macro.KEY.up:
                this.characterController.jump();
                break;
            case cc.macro.KEY.space:
                this.characterController.attack();
                break;
        }
    },

    createEnemy () {
        this.unschedule(this.createEnemy);
        this.scheduleOnce(this.createEnemy, 5);

        this.enemy = cc.instantiate(this.zombiePrefab);
        this.zombieContainer.addChild(this.enemy);
        this.enemy.getComponent('EnemyCtrl').fallDown();
        this.enemy.on('die', () => {
            this.createEnemy();
            this.increaseScore();
        });
    },

    createKnife () {
        cc.log('knife');
        this.scheduleOnce(() => {
            this.createKnife();
        }, 6);

        this.knife = cc.instantiate(this.knifePrefab);
        this.knife.x = (Math.random() * cc.view.getVisibleSize().width - cc.view.getVisibleSize().width / 2) * 0.8;
        this.knife.y = Math.random() * cc.view.getVisibleSize().height * 0.5 ;
        this.itemsContainer.addChild(this.knife);
    },

    restart () {
        this.animation.play('close');
        this.scheduleOnce(() => {
            cc.director.loadScene('Game');
        }, 2)
    },

    increaseScore () {
        this.score ++;
        this.scoreLabel.string = 'x' + this.score;
    },

    increaseKnives (amount) {
        this.knivesLabel.string = 'x' + amount;
    },

    onKeyUp (event) {
        switch(event.keyCode) {
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
                this._pressedKeyMap.set("LEFT", false);
                if (this._pressedKeyMap.get("RIGHT")) {
                    this.characterController.setDirection(true);
                    this.characterController.run();
                } else {
                    this.characterController.idle();
                }
                break;
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                this._pressedKeyMap.set("RIGHT", false);
                if (this._pressedKeyMap.get("LEFT")) {
                    this.characterController.setDirection(false);
                    this.characterController.run();
                } else {
                    this.characterController.idle();
                }
                break;
        }
    },
});
