const CharacterController = require('CharacterController');
const EnemyController = require('EnemyCtrl');

const State = cc.Enum({
    GAME: 'game',
    TRANSITION: 'transition',
    RESTART: 'restart'
});

cc.Class({
    extends: cc.Component,

    properties: {
        scoreLabel: cc.Label,
        knivesLabel: cc.Label,
        againLabel: cc.Label,
        characterController: CharacterController,
        zombieContainer: cc.Node,
        itemsContainer: cc.Node,
        zombiePrefab: cc.Prefab,
        knifePrefab: cc.Prefab,
        swordPrefab: cc.Prefab,
        spikePrefab: cc.Prefab,
        gameNode: cc.Node,
        animation: cc.Animation
    },

    start () {
        this.state = State.GAME;
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
        this.scheduleOnce(() => {
            this.createSpike();
        }, 10);

        this.characterController.node.on('die', () => {
            this.fadeScene();
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

    onKeyUp (event) {
        if (this.state !== State.GAME) {
            return;
        }
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

    onKeyDown (event) {
        switch (this.state) {
            case State.RESTART:
                this.restart();
                return;
            case State.TRANSITION:
                return;
        }
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
        this.enemy.x = (Math.random() * cc.view.getVisibleSize().width - cc.view.getVisibleSize().width / 2) * 0.8;
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

    createSpike () {
        this.scheduleOnce(() => {
            if (this.score > 20) {
                this.createSpike();
            }
            this.createSpike();
        }, 10);
        const spike = cc.instantiate(this.spikePrefab);
        spike.x = (Math.random() * cc.view.getVisibleSize().width - cc.view.getVisibleSize().width / 2) * 0.8;
        spike.y = -150;
        this.itemsContainer.addChild(spike);
        spike.runAction(cc.moveBy(0.5, 0, 100));

        this.scheduleOnce(() => {
            spike.runAction(cc.sequence(
                cc.moveBy(0.5, 0, -100),
                cc.callFunc(() => {
                    spike.destroy();
                })
            ))
        }, 4);
    },

    fadeScene () {
        this.state = State.TRANSITION;
        this.animation.play('close');
        this.scheduleOnce(() => {
            this.againLabel.node.runAction(cc.sequence(
                cc.fadeIn(1),
                cc.callFunc(() => {
                    this.state = State.RESTART;
            })));
        }, 2)
    },

    restart () {
        cc.director.loadScene('Game');
    },

    increaseScore () {
        this.score ++;
        this.scoreLabel.string = 'x' + this.score;
    },

    increaseKnives (amount) {
        this.knivesLabel.string = 'x' + amount;
    }
});
