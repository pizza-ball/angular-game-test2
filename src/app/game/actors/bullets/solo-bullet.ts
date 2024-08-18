import { leftCoordHitbox, point } from "../../../helpers/interfaces";
import { Helper } from "../../../helpers/moving-stuff";
import { FPS_TARGET, Units } from "../../globals";
import { BulletAbstract } from "./bullet-abstract";

export class SoloBullet extends BulletAbstract {
    DEFAULT_WIDTH = Units.getUnits(10);
    DEFAULT_HEIGHT = Units.getUnits(10);
    DEFAULT_SPEED = Units.getUnits(5);
    xyVel: point;
    hitbox: leftCoordHitbox;
    private minSpeed: number | undefined = undefined;
    private maxSpeed: number | undefined = undefined;
    xSpeed = 0
    ySpeed = 0
    angleManip: number | undefined;
    angleManipDuration = 0;
    angleManipCounter = 0;
    spriteData = {
        sprite: "/assets/bullets/normal/bullets31.png",
        hitbox: {
            pos: {x:0, y:0},
            width: 0,
            height: 0,
        }
    }
    color = "orange";
    center = {x: 0, y: 0};

    autoDelete = true;
    constructor(
        private startPos: point,
        private angleInRadians: number,
        speed?: number,
        size?: number,
        private accel?: number
    ) {
        super();
        speed = speed !== undefined ? speed : this.DEFAULT_SPEED;
        let width = size !== undefined ? size : this.DEFAULT_WIDTH;
        let height = size !== undefined ? size : this.DEFAULT_HEIGHT;

        this.hitbox = {
            pos: Helper.getTopLeftWithCenterPoint(width, height, startPos.x, startPos.y),
            width: width,
            height: height,
        };

        this.spriteData.hitbox = {
            pos: Helper.getTopLeftWithCenterPoint(width*this.hitboxToSpriteScale, height*this.hitboxToSpriteScale, startPos.x, startPos.y),
            width: width*this.hitboxToSpriteScale,
            height: height*this.hitboxToSpriteScale,
        }

        this.xSpeed = speed;
        this.ySpeed = speed;

        if(this.accel !== undefined){
            //adjust the acceleration based on the tickrate.
            this.accel = this.accel/FPS_TARGET;
        }

        this.xyVel = Helper.calcPointOnCircle_Radians(angleInRadians, speed);
        this.center = Helper.getCenterWithTopLeftHitbox(this.hitbox);
    }

    move() {
        if(this.accel !== undefined){
            if(this.angleManip !== undefined){
                if(this.angleManipCounter < this.angleManipDuration){
                    this.angleInRadians += this.angleManip;
                    this.angleManipCounter++;
                }
            }
            this.xSpeed += this.accel;
            this.ySpeed += this.accel;
            this.xyVel.x = Helper.calcXOnCircle_Radians(this.angleInRadians, this.xSpeed);
            this.xyVel.y = Helper.calcYOnCircle_Radians(this.angleInRadians, this.ySpeed);

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

        if(this.autoDelete){
            if(Helper.isHitboxOutsidePlayArea(this.hitbox)){
                this.flagForDeletion = true;
            }
        }
        const cent = Helper.getCenterWithTopLeftHitbox(this.hitbox);
        this.center.x = cent.x;
        this.center.y = cent.y;
        this.positionSprite();
    }

    configureMinSpeed(speed: number){
        this.minSpeed = speed;
    }

    configureMaxSpeed(speed: number){
        this.maxSpeed = speed;
    }

    alterAngleWhenMoving(degrees: number, durationSeconds: number){
        this.angleManip = Helper.degToRad(degrees);
        this.angleManipDuration = Math.round(durationSeconds*FPS_TARGET);
        this.angleManipCounter = 0;
    }
    
    setAutoDeleted(v: boolean){
        this.autoDelete = v;
    }

    changeSize(width: number, height: number){
        const newHB = Helper.getTopLeftWithCenterPoint(width, height, this.center.x, this.center.y);
        const newSpriteHB = Helper.getTopLeftWithCenterPoint(width*this.hitboxToSpriteScale, height*this.hitboxToSpriteScale, this.center.x, this.center.y);
        
        this.hitbox.width = width;
        this.hitbox.height = height;
        this.hitbox.pos.x = newHB.x;
        this.hitbox.pos.y = newHB.y;
        this.spriteData.hitbox.width = width*this.hitboxToSpriteScale;
        this.spriteData.hitbox.height = width*this.hitboxToSpriteScale;
        this.spriteData.hitbox.pos.x = newSpriteHB.x;
        this.spriteData.hitbox.pos.y = newSpriteHB.y;
    }

    private positionSprite() {
        this.spriteData.hitbox.width = this.hitbox.width * this.hitboxToSpriteScale;
        this.spriteData.hitbox.height = this.hitbox.height * this.hitboxToSpriteScale;
        const newPos = Helper.getTopLeftWithCenterPoint(this.spriteData.hitbox.width, this.spriteData.hitbox.height, this.center.x, this.center.y);
        this.spriteData.hitbox.pos.x = newPos.x;
        this.spriteData.hitbox.pos.y = newPos.y;
    }

    changeHitboxToSpriteScale(scale: number){
        this.hitboxToSpriteScale = scale;
        this.positionSprite();
    }
}