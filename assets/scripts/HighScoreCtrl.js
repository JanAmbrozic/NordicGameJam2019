cc.Class({
    extends: cc.Component,

    properties: {
        label: cc.Label
    },

    start () {
        this.gameSceneCtrl = cc.find('Canvas/GameScene').getComponent('GameScene');
        // alert(this.gameSceneCtrl.getScore());
        this.checkIfHighScore();
    },

    getSavedScore() {
        let score = cc.sys.localStorage.getItem('highScore');
        if(score === null) {
            score = 0;
            cc.sys.localStorage.setItem('highScore', score);
        }
        return score;
    },

    checkIfHighScore() {
        if ( this.getSavedScore() < this.gameSceneCtrl.getScore() ) {
            this.label.string  = `NEW HIGH SCORE: ${this.gameSceneCtrl.getScore()}`
        } else {
            this.label.string  = `PREVIOUS HIGH SCORE: ${this.getSavedScore()}`
        }
    }

    // update (dt) {},
});
