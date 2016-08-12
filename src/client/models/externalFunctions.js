import { canvasModel } from './canvasModel';
import { WIDTH, HEIGHT } from './externalVariables';

module.exports.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();

export function getId(id) {
    return document.getElementById(id);
}

export function clear(ctx) {
    // let ctx = canvasModel.getCtx().ctx;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

export function clearAll(sky, ground, lightning, tank, bullet) {
    sky.clearRect(0, 0, WIDTH, HEIGHT);
    ground.clearRect(0, 0, WIDTH, HEIGHT);
    lightning.clearRect(0, 0, WIDTH, HEIGHT);
    tank.clearRect(0, 0, WIDTH, HEIGHT);
    bullet.clearRect(0, 0, WIDTH, HEIGHT);
}

export function fillBackground(ctx, pattern) {
    ctx.rect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = pattern;
    ctx.fill();
}

export const drawTanks = (callback, tank1, tank2, tankImage, weaponImage) => {
    canvasModel.getTank().ctx.clearRect(0, 0, WIDTH, HEIGHT);
    callback(tank1, tankImage, weaponImage, tank1.weaponAngle);
    callback(tank2, tankImage, weaponImage, tank2.weaponAngle);
};

export const checkTurn = (gameInst, callback) => {
    const thisWindowPlayerId = localStorage.getItem('playerId');
    let thisWindowPlayerTurn;

    if (thisWindowPlayerId === gameInst.player1.id) {
        thisWindowPlayerTurn = gameInst.player1.turn;
    } else {
        thisWindowPlayerTurn = gameInst.player2.turn;
    }

    if (thisWindowPlayerTurn === true) {
        return callback();
    }

    return null;
};
