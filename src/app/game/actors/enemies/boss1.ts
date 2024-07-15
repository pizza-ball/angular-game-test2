import { CoordHelper } from "../../../helpers/coords";
import { DrawingStuff } from "../../../helpers/drawing-stuff";
import { bullet, leftCoordHitbox, linePath, linePathWithPause, point } from "../../../helpers/interfaces";
import { MovingStuff } from "../../../helpers/moving-stuff";
import { DEBUG_MODE, PLAYFIELD_HEIGHT, PLAYFIELD_WIDTH, TICKS_PER_SECOND } from "../../globals";
import { Danmaku } from "../bullets/patterns/x-dan";
import { SimpleBullet } from "../bullets/simple-bullet";
import { v4 as uuidv4 } from 'uuid';
import { ActorList } from "./actorlist";

export enum bossState {
    entering,
    dialog,
    pause,
    attacking,
    defeated,
    leaving
}

export class Boss1 {
    public id = uuidv4();
    public healthId = uuidv4();
    ENEMY_TYPE = ActorList.Boss1;
    LIFESPAN_SECONDS = 120;
    WIDTH = 60;
    HEIGHT = 60;
    START_POS = CoordHelper.getTopLeftWithCenterPoint(this.WIDTH, this.HEIGHT, PLAYFIELD_WIDTH, -50);
    ARRIVAL_DURATION = 1 * TICKS_PER_SECOND;

    state = bossState.entering;
    hitbox: leftCoordHitbox;
    center: point = { x: 0, y: 0 };
    flagForDeletion = false;
    powerCount = 20;
    pointCount = 100;
    phaseMaxDurations = [30 * TICKS_PER_SECOND, 30 * TICKS_PER_SECOND];
    phaseHealth = [{ max: 300, current: 300 }, { max: 300, current: 300 }];
    // phaseShooting = [
    //     {func: this.attack_circleChaser},
    //     {func: this.attack_circleChaser}
    // ];
    currentPhase = -1;  //Phase -1 is enterScene. Doesn't have the usual phase properties.
    phaseFrameCounter = 0;
    phaseStartTick = 0;
    attackPauseDuration = 0;
    phaseWasDefeatedThisFrame = false;
    constructor(
        private creationTick: number,
    ) {
        this.hitbox = {
            pos: { x: this.START_POS.x, y: this.START_POS.y },
            width: this.WIDTH,
            height: this.HEIGHT,
        };
        this.center = CoordHelper.getCenterWithTopLeftHitbox(this.hitbox);
    }

    move() {
        this.phaseWasDefeatedThisFrame = false;
        //Move in acccordance with the current phase
        if (this.state === bossState.pause) {
            return;
        }

        switch (this.currentPhase) {
            case -1:
                this.enterScene();
                break;
            case 0:
                //No movement this phase
                //this.phase1Move(tick, playerPos, bullets);
                break;
            case 1:
                //No movement this phase
                //this.phase2Move(tick, playerPos, bullets);
                break;
        }
        this.center = CoordHelper.getCenterWithTopLeftHitbox(this.hitbox);
    }

    shoot(currentTick: number, playerPos: point): SimpleBullet | SimpleBullet[] | null {
        if (this.state === bossState.pause) {
            //Run the pause handler. This must be called only once per frame.
            this.pauseHandler(currentTick);
            return null;
        }
        const ticksSincePhaseStart = currentTick - this.phaseStartTick;

        switch (this.currentPhase) {
            case -1:
                //No firing on this phase.
                return null;
            case 0:
                this.checkPhaseTimeout(ticksSincePhaseStart);
                return this.attack_accelTest(currentTick, playerPos);
            case 1:
                this.checkPhaseTimeout(ticksSincePhaseStart);
                return this.attack_circleChaser(currentTick, playerPos);
            default:
                return null;
        }
    }

    startDest = CoordHelper.getTopLeftWithCenterPoint(this.WIDTH, this.HEIGHT, PLAYFIELD_WIDTH * .5, PLAYFIELD_HEIGHT * .35);
    enterScene() {
        let vel = MovingStuff.moveToDestInSetTime_Decelerate(this.START_POS.x, this.START_POS.y, this.startDest.x, this.startDest.y, this.phaseFrameCounter, this.ARRIVAL_DURATION);
        this.hitbox.pos.x += vel.x;
        this.hitbox.pos.y += vel.y;
        this.phaseFrameCounter++;

        if (this.phaseFrameCounter > this.ARRIVAL_DURATION) {
            this.hitbox.pos.x = this.startDest.x;
            this.hitbox.pos.y = this.startDest.y;
            this.moveToNextPhase(1);
        }
    }

    moveToNextPhase(pauseDurationSec: number, successOrFail?: boolean) {
        //Trigger bonus points or some other effect if the player was "successful" in the last phase
        if (successOrFail !== undefined) {
            if (successOrFail) {
                console.log(`Phase ${this.currentPhase} defeated.`);
            } else {
                console.log(`Phase ${this.currentPhase} timed out.`);
            }
            this.phaseWasDefeatedThisFrame = true;
        }

        //If the next phase doesnt exist, the boss must die (or leave?).
        if (this.currentPhase + 1 >= this.phaseHealth.length) {
            //Flag the boss to be killed.
            this.state = bossState.defeated;
            return;
        }

        //Otherwise, we need to pause for a while before the next phase. Flag as such.
        this.state = bossState.pause
        this.attackPauseDuration = pauseDurationSec * TICKS_PER_SECOND;
    }

    pauseHandler(currentTick: number) {
        this.phaseFrameCounter++;
        if (this.phaseFrameCounter > this.attackPauseDuration) {
            this.phaseFrameCounter = 0;
            this.state = bossState.attacking;
            this.currentPhase++;
            this.phaseStartTick = currentTick + 1;
            console.log("Pause over. Moving to Phase " + this.currentPhase);
        }
    }
        
    phase1Shoot(tick: number, playerPos: point) {
        const angleToPlayer = MovingStuff.calculateRadianAngleBetweenTwoPoints(this.center.x, this.center.y, playerPos.x, playerPos.y);
        return new SimpleBullet(Object.create(this.center), angleToPlayer, 3, 40);
    }

    //Spawn bullets at 20 degree increments up to 360. rotate all angles 45*, repeat. spawn every 1 second.
    //Spawn a continuous stream at the player. Forces them to move around the boss.
    startAngle = 0;
    angleIncrement = 30;
    a_shot1Tick = 1 * TICKS_PER_SECOND;
    a_shot2Tick = TICKS_PER_SECOND/15; //every 4 frames at 60fps
    attack_circleChaser(tick: number, playerPos: point) {
        let bullets: SimpleBullet[] = [];
        if (tick % this.a_shot1Tick === 0){
            for(let i = 0; i < 360 + this.startAngle; i += this.angleIncrement){
                
                bullets.push(new SimpleBullet(Object.create(this.center), MovingStuff.degreesToRadians(i + this.startAngle), 1.5));
            }
            this.startAngle += 45;
        }

        if (tick % this.a_shot2Tick === 0){
            const angleToPlayer = MovingStuff.calculateRadianAngleBetweenTwoPoints(this.center.x, this.center.y, playerPos.x, playerPos.y);
            bullets.push(new SimpleBullet(Object.create(this.center), angleToPlayer, 3));
        }
        return bullets;
    }

    //Spawn aimed bullets at the player, with large gaps between
    //Spawn a wide cone of bullets at the top of the screen, the angles of which close in on the player. Restricts available space.
    b_shot1Tick = 1 * TICKS_PER_SECOND;
    b_shot2Tick = TICKS_PER_SECOND/30; //every 2 frames at 60fps
    b_shot3Tick = .5 * TICKS_PER_SECOND; //every 30 frames
    angle_a = 225;
    angle_b = 315;
    alternater = false;
    attack_accelTest(tick: number, playerPos: point){
        let bullets: SimpleBullet[] = [];
        if (tick % this.b_shot1Tick === 0){
            const angleToPlayer = MovingStuff.calculateRadianAngleBetweenTwoPoints(this.center.x, this.center.y, playerPos.x, playerPos.y);
            let bul1 = new SimpleBullet(Object.create(this.center), angleToPlayer, 8, 10, -16);
            bul1.configureMinSpeed(2);
            bullets.push(bul1);
        }

        if (tick % this.b_shot2Tick === 0){
            let bul1 = new SimpleBullet(Object.create(this.center), MovingStuff.degreesToRadians(this.angle_a), 8);
            let bul2 = new SimpleBullet(Object.create(this.center), MovingStuff.degreesToRadians(this.angle_b), 8);
            bullets.push(bul1);
            bullets.push(bul2);
            if(this.angle_a > 125){
                this.angle_a -= 2;
            }
            if(this.angle_b < 360+55){
                this.angle_b += 2;
            }
        }

        if (tick > 3*TICKS_PER_SECOND && tick % this.b_shot3Tick === 0){
            let rando = MovingStuff.getRandomPositiveInt(60);
            if(this.alternater){
                let rAngleShot = new SimpleBullet(Object.create(this.center), MovingStuff.degreesToRadians(270 + rando), 3, 20, 2);
                rAngleShot.alterAngleWhenMoving(3.2, 1);
                bullets.push(rAngleShot);
            } else {
                let lAngleShot = new SimpleBullet(Object.create(this.center), MovingStuff.degreesToRadians(270 - rando), 3, 20, 2);
                lAngleShot.alterAngleWhenMoving(-3.2, 1);
                bullets.push(lAngleShot);
            }
            this.alternater = !this.alternater;
        }
        return bullets;
    }

    //Experimental shot
    //attack_XChopper()

    checkPhaseTimeout(ticksSincePhaseStart: number) {
        if (ticksSincePhaseStart >= this.phaseMaxDurations[this.currentPhase]) {
            this.moveToNextPhase(1, false);
        }
    }

    hitByBullet(bullet: bullet) {
        if (this.state !== bossState.attacking) {
            return;
        }

        this.phaseHealth[this.currentPhase].current -= bullet.damage;

        //Health has been drained to 0. Move to next phase.
        if (this.phaseHealth[this.currentPhase].current <= 0) {
            DrawingStuff.deleteElementFromMemory(this.healthId);
            this.moveToNextPhase(3, true);
        }
    }

    isDefeated() {
        if (this.state === bossState.defeated) {
            return true;
        }
        return false;
    }

    wasPhaseJustDefeated() {
        return this.phaseWasDefeatedThisFrame;
    }


    drawThings(ctx: CanvasRenderingContext2D) {
        this.drawHealthCircle(ctx);
        if (DEBUG_MODE) {
            this.debugDrawPath(ctx);
        }
    }

    drawHealthCircle(ctx: CanvasRenderingContext2D) {
        if (this.state !== bossState.attacking) {
            return;
        }
        const healthPercent = this.phaseHealth[this.currentPhase].current / this.phaseHealth[this.currentPhase].max;

        DrawingStuff.deleteElementFromMemory(this.healthId);
        DrawingStuff.requestHealthDraw(this.healthId, ctx, this.center.x, this.center.y, 80, healthPercent);
    }

    called = false;
    debugDrawPath(ctx: CanvasRenderingContext2D) {
        // if (!this.called) {
        //     DrawingStuff.requestLineDraw(this.id, ctx, this.startX, this.startY, this.path[0].dest.x, this.path[0].dest.y);
        //     this.called = true;
        // }
    }

    cleanUp() {
        if (DEBUG_MODE) {
            DrawingStuff.deleteElementFromMemory(this.id);
        }
        DrawingStuff.deleteElementFromMemory(this.healthId);
    }
}