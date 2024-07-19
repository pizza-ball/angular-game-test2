import { CoordHelper } from "../../../../helpers/coords";
import { DrawingStuff } from "../../../../helpers/drawing-stuff";
import { bullet, leftCoordHitbox, linePath, linePathWithPause, point } from "../../../../helpers/interfaces";
import { MovingStuff } from "../../../../helpers/moving-stuff";
import { DEBUG_MODE, FPS_TARGET, Units } from "../../../globals";
import { SimpleBullet } from "../../bullets/simple-bullet";
import { v4 as uuidv4 } from 'uuid';
import { ActorList } from "../../actorlist";
import { SoundService } from "../../../services/sound/sound.service";
import { BossPhase } from "../../bullets/boss-phases/boss-phase";
import { Boss1_KunaiCircle } from "../../bullets/boss-phases/boss1-kunai";
import { Boss1_CircleChase } from "../../bullets/boss-phases/boss1-circle";

export enum bossState {
    entering,
    dialog,
    pause,
    attacking,
    defeated,
    leaving
}

//Time breakdown:
//60 seconds on phases
//2 seconds on phase pauses
//1 second on arrival
//Total: 63 seconds.
export class MidBoss1 {
    public id = uuidv4();
    public healthId = uuidv4();
    ENEMY_TYPE = ActorList.BossGeneric;
    WIDTH = Units.getUnits(60);
    HEIGHT = Units.getUnits(60);
    START_POS = CoordHelper.getTopLeftWithCenterPoint(this.WIDTH, this.HEIGHT, Units.getPlayfieldWidth(), Units.getUnits(-50));
    ARRIVAL_DURATION = 1 * FPS_TARGET;
    PAUSE_DURATION = 2 * FPS_TARGET;

    state = bossState.entering;
    hitbox: leftCoordHitbox;
    center: point = { x: 0, y: 0 };
    flagForDeletion = false;
    powerCount = 20;
    pointCount = 100;

    //should contain 2 30 second attack phases.
    phases: BossPhase[] = [
        new Boss1_KunaiCircle(this.soundService),
        new Boss1_CircleChase(this.soundService)
    ];
    currentPhase = -1;  //Phase -1 is enterScene. Doesn't have the usual phase properties.
    phaseFrameCounter = 0;
    phaseStartTick = 0;
    phaseCountdown = '';
    phaseWasDefeatedThisFrame = false;

    constructor(
        private soundService: SoundService,
        private creationTick: number,
    ) {
        this.hitbox = {
            pos: { x: this.START_POS.x, y: this.START_POS.y },
            width: this.WIDTH,
            height: this.HEIGHT,
        };
        this.center = CoordHelper.getCenterWithTopLeftHitbox(this.hitbox);
    }

    move(currentTick: number) {
        this.phaseWasDefeatedThisFrame = false;
        if (this.state === bossState.pause) {
            return;
        }

        const ticksSincePhaseStart = currentTick - this.phaseStartTick;

        if( this.currentPhase === -1){
            this.enterScene();
        } else {
            this.phases[this.currentPhase].moveScript(ticksSincePhaseStart, this.hitbox, this.center);
        }
        this.center = CoordHelper.getCenterWithTopLeftHitbox(this.hitbox);
    }

    shoot(currentTick: number, playerPos: point): SimpleBullet | SimpleBullet[] | null {
        if (this.state === bossState.pause) {
            return null;
        }

        const ticksSincePhaseStart = currentTick - this.phaseStartTick;

        if( this.currentPhase !== -1){
            return this.phases[this.currentPhase].shoot(ticksSincePhaseStart, this.center, playerPos);
        }
        return null;
    }

    assess(currentTick: number){
        if (this.state === bossState.pause) {
            //Run the pause handler. This must be called in only one place, once per frame.
            this.pauseHandler(currentTick);
            return;
        } else if (this.state === bossState.attacking){
            const ticksSincePhaseStart = currentTick - this.phaseStartTick;
            //Save the timeout progress to a variable. This variable can be used to display a spellcard timer.
            this.phaseCountdown = ((this.phases[this.currentPhase].DURATION/FPS_TARGET) - Math.round(ticksSincePhaseStart/FPS_TARGET)).toFixed(0);

            //Attack Timeout
            if (ticksSincePhaseStart >= this.phases[this.currentPhase].DURATION) {
                this.moveToNextPhase(false);
            }
        }
    }

    startDest = CoordHelper.getTopLeftWithCenterPoint(this.WIDTH, this.HEIGHT, Units.getPlayfieldWidth() * .5, Units.getPlayfieldHeight() * .35);
    enterScene() {
        let vel = MovingStuff.moveToDestInSetTime_Decelerate(this.START_POS.x, this.START_POS.y, this.startDest.x, this.startDest.y, this.phaseFrameCounter, this.ARRIVAL_DURATION);
        this.hitbox.pos.x += vel.x;
        this.hitbox.pos.y += vel.y;
        this.phaseFrameCounter++;

        if (this.phaseFrameCounter > this.ARRIVAL_DURATION) {
            this.hitbox.pos.x = this.startDest.x;
            this.hitbox.pos.y = this.startDest.y;
            this.moveToNextPhase();
        }
    }

    moveToNextPhase(successOrFail?: boolean) {
        DrawingStuff.deleteElementFromMemory(this.healthId);
        this.phaseCountdown = '';
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
        if (this.currentPhase + 1 >= this.phases.length) {
            //Flag the boss to be killed.
            this.state = bossState.defeated;
            return;
        }

        //Otherwise, we need to pause for a while before the next phase. Flag as such.
        this.state = bossState.pause
        this.START_POS = {x: this.hitbox.pos.x, y: this.hitbox.pos.y};
    }

    pauseHandler(currentTick: number) {
        //Move the boss back to the default location
        let vel = MovingStuff.moveToDestInSetTime_Decelerate(this.START_POS.x, this.START_POS.y, this.startDest.x, this.startDest.y, this.phaseFrameCounter, this.PAUSE_DURATION);
        this.hitbox.pos.x += vel.x;
        this.hitbox.pos.y += vel.y;

        this.phaseFrameCounter++;
        if (this.phaseFrameCounter > this.PAUSE_DURATION) {
            this.hitbox.pos.x = this.startDest.x;
            this.hitbox.pos.y = this.startDest.y;
            this.phaseFrameCounter = 0;
            this.state = bossState.attacking;
            this.currentPhase++;
            this.phaseStartTick = currentTick;
            console.log("Pause over. Moving to Phase " + this.currentPhase);
        }
    }

    hitByBullet(bullet: bullet) {
        if (this.state !== bossState.attacking) {
            return;
        }

        this.phases[this.currentPhase].currentHealth -= bullet.damage;

        //Health has been drained to 0. Move to next phase.
        if (this.phases[this.currentPhase].currentHealth <= 0) {
            this.moveToNextPhase(true);
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
        const healthPercent = this.phases[this.currentPhase].currentHealth / this.phases[this.currentPhase].MAX_HEALTH;

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