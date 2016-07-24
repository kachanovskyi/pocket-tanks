import externalVariables from './externalVariables';
import paper from 'paper';
import { findLinePoints } from './tankMovement';
import { tick } from './explosion';
import { calculateDamageArea } from './generateDamage';
import { ground } from './groundModel';
import { drawGround } from './canvasRedrawModel';
import { drawSky } from './canvasRedrawModel'
import { requestAnimFrame } from './externalFunctions';

let WIDTH = externalVariables.WIDTH,
    HEIGHT = externalVariables.HEIGHT,
    originalPoints,
    weaponWidth = externalVariables.WEAPONWIDTH;
    let lastTime,
        dt2 = 0,
        bullet,
        lastFire = Date.now(),
        gameTime = 0,
        power = 30,
        angle = 60,
        bulletImg = new Image();
    const g = 9.81;

    bulletImg.src='./public/images/bullet2.png';
    var ctx2,
        tankX,
        tankY,
        angleWeapon,
        newBackCtx, newBackCanvas, newPattern, socket;

    const makeShot = (ctx, backCanvas, backCtx, pattern, tankCoordX, tankCoordY, angleWeaponValue, socketIo) => {
        originalPoints = ground.getGround();

        socket = socketIo;
        ctx2 = ctx;
        tankX = tankCoordX;
        tankY = tankCoordY;
        angleWeapon = angleWeaponValue;
        newBackCanvas = backCanvas;
        newBackCtx = backCtx;
        newPattern = pattern;

        dt2=0;
        bullet = { pos: [tankX, tankY],
            imgInf: new ImgInf(bulletImg.src, [0,0], angle, power),
            angle: angle,
            bulletSpeed: power
        };
        lastFire = Date.now();
        shotStart();
    };

    module.exports.makeShot = makeShot;
    const shotStart = () => {

        lastTime = Date.now();
        drawBullet();
    };

    const drawBullet = () => {

            clear();
            fillBackground();
            drawTank(tankX, tankY);

            var now = Date.now();
            var dt = (now - lastTime) / 1000.0;
            update(dt);
            renderEntity(bullet);
            lastTime = now;
    };

    const update = (dt) => {
            gameTime += dt;
            generateExplosion(dt);
    };

    const generateExplosion = (dt) => {

            bullet.pos[0] = tankX + weaponWidth * Math.cos(angleWeapon + angle*Math.PI/180) + bullet.bulletSpeed * dt2*Math.cos(bullet.angle*Math.PI/180 + angleWeapon);
            bullet.pos[1] = tankY-30 - weaponWidth * Math.sin(angleWeapon + angle*Math.PI/180)- (bullet.bulletSpeed * dt2*Math.sin(bullet.angle*Math.PI/180 + angleWeapon) - g * dt2 * dt2 / 2);

            dt2 += 4*dt;
                // creating path for bullet and originalPoints
                var bull = new paper.Path.Rectangle(bullet.pos[0],bullet.pos[1], 45, 7);
            //check angle for accuracy of point
            bull.rotate(-bullet.imgInf.currAngle);

            var groundPath = new paper.Path(
                new paper.Point(originalPoints[0][0], originalPoints[0][1])
                );
            for(let i = 1; i < originalPoints.length; i++) {
                groundPath.add(new paper.Point(originalPoints[i][0], originalPoints[i][1]))
            }
            // check if intersect the original points
            var intersect = bull.getIntersections(groundPath);
            if(intersect.length > 0 ) {
                bullet = null;

                let crossPoint = {
                    x: intersect[0]._point.x,
                    y: intersect[0]._point.y
                };
                console.log( 'x:' +  crossPoint.x, 'y:' + crossPoint.y );

                tick(crossPoint.x, crossPoint.y, tankX, tankY, ctx2);
                window.cancelAnimationFrame(requestAnimFrame);

                let calculatedGroundPoints = calculateDamageArea(originalPoints, crossPoint.x, crossPoint.y);
                
                ground.setGround(calculatedGroundPoints);
                clear();
                drawSky(newBackCtx);
                drawGround(ground.getGround(), newBackCtx);

                newPattern = ctx2.createPattern(newBackCanvas, "no-repeat");

                fillBackground(newPattern);
                drawTank(tankX, tankY);
            }
            else if(bullet.pos[0]>WIDTH || bullet.pos[1]>HEIGHT)
            {
                bullet = null;
                window.cancelAnimationFrame(requestAnimFrame);

                clear();
                drawSky(newBackCtx);
                drawGround(ground.getGround(), newBackCtx);

                newPattern = ctx2.createPattern(newBackCanvas, "no-repeat");
                tankY = findLinePoints(tankX);

                fillBackground(newPattern);
                drawTank(tankX, tankY);
            }
            else
            {
                requestAnimFrame(drawBullet);
            }
    };

    const renderEntity = (entity) => {
        if(entity){
            socket.emit('inputPos',{
                posX: bullet.pos[0],
                posY: bullet.pos[1],
                angle: angle,
                power: power,
                angleWeapon: angleWeapon,
                deltaT: dt2
            });
            entity.imgInf.render(ctx2, dt2);
            socket.on('outputPos', function(data){
                return entity.imgInf.render(ctx2, dt2, data);
            });
 
        }
    };

    (function() {
        function ImgInf(url, pos, angle, v0) {
            this.pos = pos;
            this.url = url;
            this.angle=angle;
            this.v0=v0;
            this.currAngle = 0;
        }

        ImgInf.prototype = {

            render: function(ctx, dt2, data) {
                ctx.save();
                var x = this.pos[0];
                var y = this.pos[1];
                if(data)
                {
                    clear();
                    fillBackground(newPattern);
                    drawTank(tankX, tankY);
                    ctx.translate(data.x, data.y);
                    var A=data.power*Math.cos(data.angle*Math.PI/180 + data.angleWeapon);
                    this.currAngle=Math.atan(((data.power)*Math.sin(data.angle*Math.PI/180 + data.angleWeapon)-g*data.deltaT)/A);
                    ctx.rotate(-this.currAngle);
                    ctx.drawImage(bulletImg, x, y);
                    ctx.restore();
                }
                else
                {
                    ctx.translate(bullet.pos[0], bullet.pos[1]);
                    var A=this.v0*Math.cos(this.angle*Math.PI/180 + angleWeapon);
                    this.currAngle=Math.atan(((this.v0)*Math.sin(this.angle*Math.PI/180 + angleWeapon)-g*dt2)/A);
                    ctx.rotate(-this.currAngle);
                    ctx.drawImage(bulletImg, x, y);
                    ctx.restore();
                }
            }
        };

        window.ImgInf = ImgInf;
    })();