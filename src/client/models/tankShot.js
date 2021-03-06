'use strict';
import paper from 'paper';
import { ground } from './groundModel';
import { tankMove, findLinePoints } from './tankMovement';
import { navPanel } from './navPanel';
import { makeShot, intersectionPlayer } from './shotTrajectory';
import { rideTime } from './externalVariables';
import { getId, clear, drawTanks, drawLifeBars, getTurnId } from './externalFunctions';
import { Tank } from './tankModel';
import { drawGround, drawSky } from './canvasRedrawModel';
import { canvasModel } from './canvasModel';
import { drawTank } from './drawTank';

let originalPoints;
let tank1;
let tank2;
let angle;

const tankImage = new Image();
const weaponImage = new Image();

module.exports.initGame = (gameInst, socket) => {
    let playerTurnId = getTurnId(gameInst);

    function receiveUpdatedData(data) {
        if (data) {
            gameInst = data;
        }
        ground.setGround(data.originalPoints);
        const groundCtx = canvasModel.getGround().ctx;
        clear(groundCtx);
        drawGround(ground.getGround(), groundCtx);
        drawLifeBars(data);
        playerTurnId = getTurnId(gameInst);
    }

    const tankCtx = canvasModel.getTank().ctx;

    originalPoints = ground.getGround();
    let lastTimeTankMoved = 0;

/* ====== initialization ======== */
    paper.setup(canvasModel.getBullet().canvas);

    angle = parseInt(getId('angle').innerHTML);

/* ====== Tank Weapon Movement ======== */

    const weaponToMove = (value) => {
        let weaponMoves;
        if (localStorage.getItem('playerId') === tank1.id) {
            weaponMoves = 'tank1';
        } else {
            weaponMoves = 'tank2';
            value = value + Math.PI;
        }

        socket.emit('inputPosWeapon', {
            weaponMoves,
            angle: value,
            tank1,
            tank2
        });
    };

    const weaponMove = (tankParam, angleParam) => {
        clear(tankCtx);
        if (tankParam === 'tank1') {
            tank1.setWeaponAngle(angleParam);
            drawTanks(drawTank, tank1, tank2, tankImage, weaponImage);
        } else {
            tank2.setWeaponAngle(angleParam);
            drawTanks(drawTank, tank2, tank1, tankImage, weaponImage);
        }
    };

    const bulletToMove = () => {
        let bulletMoves;
        let tank;
        if (localStorage.getItem('playerId') === tank1.id) {
            bulletMoves = 'tank1';
            tank = tank1;
        } else {
            bulletMoves = 'tank2';
            tank = tank2;
        }

        socket.emit('inputBulletPos', {
            bulletMoves,
            tank
        });
    };

    const bulletMove = (tankParam) => {
        if (tankParam === 'tank1') {
            makeShot(
                canvasModel.getBullet().ctx,
                tank1,
                tank1.getCoord().tankX,
                tank1.getCoord().tankY,
                tank1.getTankAngle(),
                tank1.getWeaponAngle(),
                socket

            );
        } else {
            makeShot(
                canvasModel.getBullet().ctx,
                tank2,
                tank2.getCoord().tankX,
                tank2.getCoord().tankY,
                tank2.getTankAngle(),
                tank2.getWeaponAngle(),
                socket
            );
        }
    };

/* ========  Tank movement ======== */

    const tankToMove = (direction) => {
        let tankMoves;

        if (localStorage.getItem('playerId') === tank1.id) {
            tankMoves = 'tank1';
        } else {
            tankMoves = 'tank2';
        }

        socket.emit('inputPosTank', {
            direction,
            tankMoves,
            tank1,
            tank2
        });
    };

    const doKeyDown = (evt) => {
        const now = new Date().getTime();

        if (getTurnId(gameInst) === localStorage.getItem('playerId')) {
            switch (evt.keyCode) {
                case 37:  /* Left arrow was pressed */
                    if (now - lastTimeTankMoved > rideTime) {
                        tankToMove('left');
                        lastTimeTankMoved = now;
                    }
                    break;

                case 38:    //Up arrow was pressed /
                    if (angle >= 80) {
                        return;
                    }
                    angle += 5;
                    getId('angle').innerHTML = angle;
                    weaponToMove(angle * Math.PI / 180);
                    break;

                case 39:  /* Right arrow was pressed */
                    if (now - lastTimeTankMoved > rideTime) {
                        tankToMove('right');
                        lastTimeTankMoved = now;
                    }
                    break;

                case 40:   //Down arrow was pressed /
                    angle -= 5;
                    getId('angle').innerHTML = angle;
                    weaponToMove(angle * Math.PI / 180);
                    break;

                case 13: /*ENTER*/
                    bulletToMove();
                    tank1.tankY = findLinePoints(tank1.tankX);
                    tank2.tankY = findLinePoints(tank2.tankX);
                    drawTanks(drawTank, tank1, tank2, tankImage, weaponImage);
                    break;
            }
        }
    };

    (function initialization() {
        tankImage.src = './public/images/tankVehicle.png';
        weaponImage.src = './public/images/tankWeapon_straight.png';

        weaponImage.onload = () => {

            drawSky(canvasModel.getSky().ctx);
            drawGround(originalPoints, canvasModel.getGround().ctx);
            tank1 = new Tank(
                gameInst.player1.id,
                gameInst.player1.tank.tankX,
                gameInst.player1.tank.tankAngle,
                gameInst.player1.tank.weaponAngle
            );
            tank2 = new Tank(
                gameInst.player2.id,
                gameInst.player2.tank.tankX,
                gameInst.player2.tank.tankAngle,
                gameInst.player2.tank.weaponAngle + Math.PI
            );

            intersectionPlayer(tank1, tank2, gameInst);

            socket.emit('initPosTank', { tank1, tank2 });

            socket.on('initOutPosTank', (data) => {
                tank1.setCoord(data.tank1.tankX, data.tank1.tankY);
                tank2.setCoord(data.tank2.tankX, data.tank2.tankY);

                clear(canvasModel.getTank().ctx);

                drawTanks(drawTank, tank1, tank2, tankImage, weaponImage);
            });

            navPanel(tank1, tank2, socket, gameInst);
            drawLifeBars(gameInst);
        };
    })();

    socket.on('return-updated-gameData', (gameData) => {
        receiveUpdatedData(gameData);
    });

    socket.on('sendCoordsOnClient', (data) => {
        if (tank1.id === data.tank.id) {
            tank1.setCoord(data.tank.tankX, data.tank.tankY);
        } else if (tank2.id === data.tank.id) {
            tank2.setCoord(data.tank.tankX, data.tank.tankY);
        }
    });

    socket.on('outputBulletPos', (data) => {
        bulletMove(data.bulletMoves);
    });

    socket.on('outputPosWeapon', (data) => {
        weaponMove(data.weaponMoves, data.angle);
    });

    socket.on('outputPosTank', (data) => {
        tankMove(data.direction, data.tankMoves, data.tank1, data.tank2, tankImage, weaponImage, socket);
    });

    window.addEventListener('keydown', doKeyDown, true);

    module.exports.weaponToMove = weaponToMove;
    module.exports.bulletToMove = bulletToMove;
};
