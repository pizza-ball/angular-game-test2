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
    minSpeed: number | undefined = undefined;
    xSpeed = 0
    ySpeed = 0
    angleManip: number | undefined;
    angleManipDuration = 0;
    angleManipCounter = 0;
    color = "orange";
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

        this.xyVel = MovingStuff.calculateXYVelocityWithRadians(angleInRadians, speed);
    }

    move() {
        if(this.accel !== undefined){
            if(this.angleManip !== undefined){
                if(this.angleManipCounter < this.angleManipDuration){
                    this.angleInRadians += this.angleManip;
                    this.angleManipCounter++;
                }
            }
            this.xyVel.x = MovingStuff.calculateXVelocityWithRadians(this.angleInRadians, this.xSpeed, this.accel);
            this.xyVel.y = MovingStuff.calculateYVelocityWithRadians(this.angleInRadians, this.ySpeed, this.accel);
            this.xSpeed += this.accel;
            this.ySpeed += this.accel;

            if(this.minSpeed !== undefined){
                if(Math.abs(this.xSpeed) < Math.abs(this.minSpeed)){
                    this.xSpeed = this.minSpeed;
                }
                if(Math.abs(this.ySpeed) < Math.abs(this.minSpeed)){
                    this.ySpeed = this.minSpeed;
                }
            }
        }
        this.hitbox.pos.x += this.xyVel.x;
        this.hitbox.pos.y += this.xyVel.y;

        this.flagForDeletion = CoordHelper.isHitboxOutsidePlayArea(this.hitbox.pos.x, this.hitbox.pos.y, this.hitbox.height, this.hitbox.width);
    }

    configureMinSpeed(speed: number){
        this.minSpeed = speed;
    }

    alterAngleWhenMoving(degrees: number, durationSeconds: number){
        this.angleManip = MovingStuff.degreesToRadians(degrees);
        this.angleManipDuration = Math.round(durationSeconds*FPS_TARGET);
        this.angleManipCounter = 0;
    }
}