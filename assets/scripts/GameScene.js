const CharacterController = require('CharacterController');
const EnemyController = require('EnemyCtrl');
const HighScoreCtrl = require('HighScoreCtrl');

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
        highScore: HighScoreCtrl,
        characterController: CharacterController,
        zombieContainer: cc.Node,
        itemsContainer: cc.Node,
        groundContainer: cc.Node,
        zombiePrefab: cc.Prefab,
        knifePrefab: cc.Prefab,
        knifePackPrefab: cc.Prefab,
        swordPrefab: cc.Prefab,
        spikePrefab: cc.Prefab,
        gameNode: cc.Node,
        animation: cc.Animation
    },

    start () {
        this.enemyInterval = 8;
        this.enemyAmount = 0;

        this.state = State.GAME;
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;

        this._pressedKeyMap = new Map();
        // add key down and key up event
        this.onKeyDownCallback = (event) => this.onKeyDown(event);
        this.onKeyUpCallback = (event) => this.onKeyUp(event);
        cc.game.canvas.addEventListener(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDownCallback);
        cc.game.canvas.addEventListener(cc.SystemEvent.EventType.KEY_UP, this.onKeyUpCallback);
        cc.game.canvas.addEventListener(cc.Node.EventType.MOUSE_DOWN, this.onKeyDownCallback);

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
        cc.game.canvas.removeEventListener(cc.Node.EventType.MOUSE_DOWN, this.onKeyDownCallback);
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
                this.characterController.attackSword();
                break;
            case cc.macro.KEY.enter:
                this.characterController.attack();
                break;
            case cc.macro.KEY.x:
                this.characterController.attack();
                break;
            case cc.macro.MOUSE_DOWN:
             if(event.button === cc.Event.EventMouse.BUTTON_RIGHT) {
                this.characterController.attack();
             } else {
                this.characterController.attackSword();
             }
             break;

        }
    },

    createEnemy () {
        if (this.score < 10 && this.enemyAmount > 0) {
            return;
        }
        if (this.score < 20 && this.enemyAmount > 1) {
            return;
        }
        if (this.score < 30 && this.enemyAmount > 2) {
            return;
        }
        this.enemyAmount ++;

        this.enemy = cc.instantiate(this.zombiePrefab);
        this.enemy.x = (Math.random() * cc.view.getVisibleSize().width - cc.view.getVisibleSize().width / 2) * 0.8;
        this.enemy.y = 500;
        this.zombieContainer.addChild(this.enemy);
        this.enemy.getComponent(EnemyController).fallDown();
        if (this.score < 5) {
            this.enemy.getComponent(EnemyController).setSpeed(200);
        } else if (this.score < 15) {
            this.enemy.getComponent(EnemyController).setSpeed(500);
        } else if (this.score < 30) {
            this.enemy.getComponent(EnemyController).setSpeed(700);
        }
        this.enemy.getComponent(EnemyController).setGroundContainer(this.groundContainer);
        this.enemy.on('die', () => {
            this.enemyAmount--;
            this.createEnemy();
            this.createEnemy();
            this.createEnemy();

            this.increaseScore();
        });
    },

    createKnife () {
        this.scheduleOnce(() => {
            this.createKnife();
        }, 6);

        let knife;
        if (Math.random() < 0.2) {
            knife = cc.instantiate(this.knifePackPrefab);
        } else {
            knife = cc.instantiate(this.knifePrefab);
        }
        knife.x = this._getRandomPosition();
        knife.y = Math.random() * cc.view.getVisibleSize().height * 0.5 ;
        this.itemsContainer.addChild(knife);

        this.scheduleOnce(() => {
            knife.runAction(cc.sequence(
                cc.fadeIn(0.5),
                cc.callFunc(() => {
                    knife.destroy();
                })
            ))
        }, 4);
    },

    createSpike () {
        this.scheduleOnce(() => {
            if (this.score > 20) {
                this.createSpike();
            }
            this.createSpike();
        }, 10);
        const spike = cc.instantiate(this.spikePrefab);
        spike.x = this._getRandomPosition();
        spike.y = -150;
        this.itemsContainer.addChild(spike);
        spike.runAction(cc.moveBy(0.2, 0, 100));

        this.scheduleOnce(() => {
            spike.runAction(cc.sequence(
                cc.moveBy(0.5, 0, -100),
                cc.callFunc(() => {
                    spike.destroy();
                })
            ))
        }, 4);
    },

    _getRandomPosition () {
        while(true) {
            let x = (Math.random() * cc.view.getVisibleSize().width - cc.view.getVisibleSize().width / 2) * 0.8;
            if (Math.abs(this.characterController.container.x - x) > 400) {
                return x;
            }
        }
    },

    fadeScene () {
        this.unscheduleAllCallbacks();

        cc.audioEngine.stopAllEffects();
        this.state = State.TRANSITION;
        this.animation.play('close');
        this.againLabel.node.opacity = 1;
        this.scheduleOnce(() => {
            this.againLabel.node.runAction(cc.sequence(
                cc.fadeTo(1, 255),
                cc.callFunc(() => {
                    this.state = State.RESTART;
            })));
            this.highScore.checkIfHighScore();
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
    },

    getScore () {
        return this.score;
    }
});
