// simpleBullet is a bullet aimed at a set point, and moves linearly towards it with a set speed. 

import { CoordHelper } from "../../../helpers/coords";
import { leftCoordHitbox, point } from "../../../helpers/interfaces";
import { MovingStuff } from "../../../helpers/moving-stuff";
import { FPS_TARGET, Units } from "../../globals";

// Very basic projectile.
export class SimpleBullet {
    DEFAULT_WIDTH = Units.getUnits(10);
    DEFAULT_HEIGHT = Units.getUnits(10);
    DEFAULT_SPEED = Units.getUnits(5);
    xyVel: point;
    hitbox: leftCoordHitbox;
    flagForDeletion = false;
    private minSpeed: number | undefined = undefined;
    private maxSpeed: number | undefined = undefined;
    xSpeed = 0
    ySpeed = 0
    angleManip: number | undefined;
    angleManipDuration = 0;
    angleManipCounter = 0;
    color = "orange";
    center = {x: 0, y: 0};

    //TODO: this should be in a different class, and SimpleBullet should extend a bullet abstract
    isRotational = false;
    constructor(
        private startPos: point,
        private angleInRadians: number,
        speed?: number,
        size?: number,
        private accel?: number
    ) {
        speed = speed !== undefined ? speed : this.DEFAULT_SPEED;
        let width = size !== undefined ? size : this.DEFAULT_WIDTH;
        let height = size !== undefined ? size : this.DEFAULT_HEIGHT;

        this.hitbox = {
            pos: CoordHelper.getTopLeftWithCenterPoint(width, height, startPos.x, startPos.y),
            width: width,
            height: height,
        };

        this.xSpeed = speed;
        this.ySpeed = speed;

        if(this.accel !== undefined){
            //adjust the acceleration based on the tickrate.
            this.accel = this.accel/FPS_TARGET;
        }

        this.xyVel = MovingStuff.calcPointOnCircle_Radians(angleInRadians, speed);
        this.center = CoordHelper.getCenterWithTopLeftHitbox(this.hitbox);
    }

    move() {
        if(this.isRotational){
            this.xyVel = MovingStuff.calcPointOnCircle_Degrees(this.angle, this.radius);
            const newPos = CoordHelper.getTopLeftWithCenterPoint(this.hitbox.width, this.hitbox.height, this.circCenter.x + this.xyVel.x, this.circCenter.y + this.xyVel.y);
            this.hitbox.pos.x = newPos.x;
            this.hitbox.pos.y = newPos.y;
            
            this.angle += this.angleIncr;
            this.radius += this.radiusGrowth;
            this.flagForDeletion = CoordHelper.isRadiusOfRotationTooLarge(this.radius);
            const cent = CoordHelper.getCenterWithTopLeftHitbox(this.hitbox);
            this.center.x = cent.x;
            this.center.y = cent.y;
            return;
        }
        if(this.accel !== undefined){
            if(this.angleManip !== undefined){
                if(this.angleManipCounter < this.angleManipDuration){
                    this.angleInRadians += this.angleManip;
                    this.angleManipCounter++;
                }
            }
            this.xSpeed += this.accel;
            this.ySpeed += this.accel;
            this.xyVel.x = MovingStuff.calcXOnCircle_Radians(this.angleInRadians, this.xSpeed);
            this.xyVel.y = MovingStuff.calcYOnCircle_Radians(this.angleInRadians, this.ySpeed);

            if(this.minSpeed !== undefined){
                if(Math.abs(this.xSpeed) < Math.abs(this.minSpeed)){
                    this.xSpeed = this.minSpeed;
                }
                if(Math.abs(this.ySpeed) < Math.abs(this.minSpeed)){
                    this.ySpeed = this.minSpeed;
                }
            }

            if(this.maxSpeed !== undefined){
                if(Math.abs(this.xSpeed) > Math.abs(this.maxSpeed)){
                    this.xSpeed = this.maxSpeed;
                }
                if(Math.abs(this.ySpeed) > Math.abs(this.maxSpeed)){
                    this.ySpeed = this.maxSpeed;
                }
            }
        }
        this.hitbox.pos.x += this.xyVel.x;
        this.hitbox.pos.y += this.xyVel.y;

        this.flagForDeletion = CoordHelper.isHitboxOutsidePlayArea(this.hitbox);
        const cent = CoordHelper.getCenterWithTopLeftHitbox(this.hitbox);
        this.center.x = cent.x;
        this.center.y = cent.y;
    }

    configureMinSpeed(speed: number){
        this.minSpeed = speed;
    }

    configureMaxSpeed(speed: number){
        this.maxSpeed = speed;
    }

    alterAngleWhenMoving(degrees: number, durationSeconds: number){
        this.angleManip = MovingStuff.degreesToRadians(degrees);
        this.angleManipDuration = Math.round(durationSeconds*FPS_TARGET);
        this.angleManipCounter = 0;
    }

    circCenter = {x: 0, y: 0};
    radius = 0;
    radiusGrowth = 0;
    angle = 0;
    angleIncr = 0;
    changeToRotational(circCenter: point, r: number, rGrowth: number, angle: number, angleIncr: number){
        this.isRotational = true;
        this.circCenter = circCenter;
        this.radiusGrowth = rGrowth;
        this.angle = angle;
        this.angleIncr = angleIncr;
        this.radius = r;
    }
}