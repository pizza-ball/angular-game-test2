import { CoordHelper } from "../../../helpers/coords";
import { leftCoordHitbox, point } from "../../../helpers/interfaces";
import { MovingStuff } from "../../../helpers/moving-stuff";
import { FPS_TARGET, Units } from "../../globals";
import { BulletAbstract } from "./bullet-abstract";
import { Danmaku } from "./patterns/danmaku";

export enum BoundBullet_MoveType {
    circle,
    cube,
}

//Bullet linked to an owner point. Orients itself relative to the owner point's position.
//Owner point may or may not move. Do not re-assign this.owner.
export class BoundBullet extends BulletAbstract {
    DEFAULT_WIDTH = Units.getUnits(10);
    DEFAULT_HEIGHT = Units.getUnits(10);
    hitbox: leftCoordHitbox;
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
        public owner: point,
        public moveType: BoundBullet_MoveType,
        size?: number,
    ) {
        super();
        let width = size !== undefined ? size : this.DEFAULT_WIDTH;
        let height = size !== undefined ? size : this.DEFAULT_HEIGHT;

        this.hitbox = {
            pos: CoordHelper.getTopLeftWithCenterPoint(width, height, 0, 0),
            width: width,
            height: height,
        };

        this.spriteData.hitbox = {
            pos: CoordHelper.getTopLeftWithCenterPoint(width*2.5, height*2.5, 0, 0),
            width: width*2.5,
            height: height*2.5,
        }

        this.center = CoordHelper.getCenterWithTopLeftHitbox(this.hitbox);
    }

    move() {
        if(this.moveType === BoundBullet_MoveType.circle){
            this.circularMove();
        } else if(this.moveType === BoundBullet_MoveType.cube){
            this.cubeMove();
        }
    }

    public circularCfg = {
        initialized: false,
        radius: 0,
        radiusGrowth: 0,
        angle: 0,
        angleIncr: 0
    }
    private circularMove() {
        if(!this.circularCfg.initialized){
            console.error("ERROR: attempting BoundBullet circularMove without setting movement config.");
            return;
        }
        const xyVel = MovingStuff.calcPointOnCircle_Degrees(this.circularCfg.angle, this.circularCfg.radius);
        const newPos = CoordHelper.getTopLeftWithCenterPoint(this.hitbox.width, this.hitbox.height, this.owner.x + xyVel.x, this.owner.y + xyVel.y);
        this.hitbox.pos.x = newPos.x;
        this.hitbox.pos.y = newPos.y;

        this.circularCfg.angle += this.circularCfg.angleIncr;
        this.circularCfg.radius += this.circularCfg.radiusGrowth;
        if (this.autoDelete) {
            this.flagForDeletion = CoordHelper.isRadiusOfRotationTooLarge(this.circularCfg.radius);
        }
        const cent = CoordHelper.getCenterWithTopLeftHitbox(this.hitbox);
        this.center.x = cent.x;
        this.center.y = cent.y;
        this.moveSprite();
    }

    setCircularMovementData(r: number, rGrowth: number, angle: number, angleIncr: number){
        this.circularCfg = {
            initialized: true,
            radius: r,
            radiusGrowth: rGrowth,
            angle: angle,
            angleIncr: angleIncr
        }
    }

    public cubeCfg = {
        vertId: '',
        w: 0,
        h: 0,
        z: 0,
        wRate: 0,
        hRate: 0,
        wCur: 0,
        hCur: 0,
        xrCur: 0,
        yrCur: 0,
        zrCur: 0,
        xrChange: 0,
        yrChange: 0,
        zrChange: 0,
    }
    OG_WIDTH = 15;
    OG_HEIGHT = 15;
    private cubeMove() {
        if(!this.cubeCfg.vertId){
            console.error("ERROR: attempting BoundBullet cubeMove without setting movement config.");
            return;
        }

        //reset the point to its default position relative to the owner.
        this.resetVertexPosition(this.cubeCfg.vertId, this.cubeCfg.wCur, this.cubeCfg.hCur);
        this.hitbox.width = this.OG_WIDTH;
        this.hitbox.height = this.OG_HEIGHT;

        //reposition the point to (0,0) for rotation calculation
        let p = {x: this.center.x - this.owner.x, y: this.center.y - this.owner.y, z: this.cubeCfg.z};

        //Calculates the new position of this point relative to (0,0)
        let result3D = Danmaku.rotateCubeVertex(p, this.cubeCfg.xrCur, this.cubeCfg.yrCur, this.cubeCfg.zrCur);

        //Re-positions the point relative to the owner
        result3D.x = result3D.x + this.owner.x;
        result3D.y = result3D.y + this.owner.y; 

        //adjust SCALE to simulate depth. 0 is normal size. Z axis scales to... 300?
        const scale =  (result3D.z/300)+1; //gets a percentage scaling factor
        this.hitbox.width = this.hitbox.width*scale;
        this.hitbox.height = this.hitbox.height*scale;
        this.overlap = Math.round(scale*10);

        //Set the hitbox and center again for drawing.
        const newHB = CoordHelper.getTopLeftWithCenterPoint(this.hitbox.width, this.hitbox.height, result3D.x, result3D.y);
        this.hitbox.pos.x = newHB.x;
        this.hitbox.pos.y = newHB.y;
        const cent = CoordHelper.getCenterWithTopLeftHitbox(this.hitbox);
        this.center.x = cent.x;
        this.center.y = cent.y;

        //adjust all angles.
        this.cubeCfg.xrCur += this.cubeCfg.xrChange;
        this.cubeCfg.yrCur += this.cubeCfg.yrChange;
        this.cubeCfg.zrCur += this.cubeCfg.zrChange;

        this.moveSprite();

        //Expands the bullets out from the center point instead of instantly appearing in their set width/height
        if(this.cubeCfg.hCur < this.cubeCfg.h){
            this.cubeCfg.hCur += this.cubeCfg.hRate;
            if(this.cubeCfg.hCur > this.cubeCfg.h){
                this.cubeCfg.hCur = this.cubeCfg.h;
            }
        }
        if(this.cubeCfg.wCur < this.cubeCfg.w){
            this.cubeCfg.wCur += this.cubeCfg.wRate;
            if(this.cubeCfg.wCur > this.cubeCfg.w){
                this.cubeCfg.wCur = this.cubeCfg.w;
            }
        }
    }

    setCubeMovementData(vertexId: string, z: number, w: number, h: number, wRate: number, hRate: number, xrs: number, yrs: number, zrs: number, xrc: number, yrc: number, zrc: number){
        this.cubeCfg = {
            vertId: vertexId,
            w: w,
            h: h,
            z: z,
            wRate: wRate,
            hRate: hRate,
            wCur: 0,
            hCur: 0,
            xrCur: xrs,
            yrCur: yrs,
            zrCur: zrs,
            xrChange: xrc,
            yrChange: yrc,
            zrChange: zrc,
        }

        //this.resetVertexPosition(vertexId, w, h);
    }
    
    private resetVertexPosition(vertexId: string, w: number, h: number) {
        switch (vertexId) {
            case 'f0':
            case 'b0':
                this.center.x = this.owner.x - w / 2;
                this.center.y = this.owner.y - h / 2;
                break;
            case 'f1':
            case 'b1':
                this.center.x = this.owner.x + w / 2;
                this.center.y = this.owner.y - h / 2;
                break;
            case 'f2':
            case 'b2':
                this.center.x = this.owner.x - w / 2;
                this.center.y = this.owner.y + h / 2;
                break;
            case 'f3':
            case 'b3':
                this.center.x = this.owner.x + w / 2;
                this.center.y = this.owner.y + h / 2;
                break;
        }
    }

    setAutoDeleted(v: boolean){
        this.autoDelete = v;
    }

    private moveSprite(){
        this.spriteData.hitbox.width = this.hitbox.width*2.5;
        this.spriteData.hitbox.height = this.hitbox.height*2.5;
        const newPos = CoordHelper.getTopLeftWithCenterPoint(this.spriteData.hitbox.width, this.spriteData.hitbox.height, this.center.x, this.center.y);
        this.spriteData.hitbox.pos.x = newPos.x;
        this.spriteData.hitbox.pos.y = newPos.y;
    }
}