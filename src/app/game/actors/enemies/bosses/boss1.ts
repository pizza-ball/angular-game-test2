import { CoordHelper } from "../../../../helpers/coords";
import { DrawingStuff } from "../../../../helpers/drawing-stuff";
import { bullet, leftCoordHitbox, linePath, point } from "../../../../helpers/interfaces";
import { MovingStuff } from "../../../../helpers/moving-stuff";
import { DEBUG_MODE, FPS_TARGET, Units } from "../../../globals";
import { SimpleBullet } from "../../bullets/simple-bullet";
import { v4 as uuidv4 } from 'uuid';
import { ActorList } from "../../actorlist";
import { SoundService } from "../../../services/sound/sound.service";
import { Boss_CircleChase } from "../../bullets/boss-phases/L1/boss-circle";
import { Boss_VandBoomerangs } from "../../bullets/boss-phases/L1/boss-boomer";
import { BossPhase } from "../../bullets/boss-phases/boss-phase";
import { Boss_KunaiCircles } from "../../bullets/boss-phases/L1/boss-kunai";
import { Boss, bossState } from "./boss-abstract";
import { Enemy } from "../enemy-abstract";
import { Boss_Cross } from "../../bullets/boss-phases/L1/boss-cross";
import { Boss_SpiralGaps } from "../../bullets/boss-phases/L1/boss-spiralgaps";
import { BulletAbstract } from "../../bullets/bullet-abstract";

export class Boss1 extends Boss {
    public id = uuidv4();
    public healthId = uuidv4();
    ENEMY_TYPE = ActorList.BossGeneric;
    ARRIVAL_DURATION = 1 * FPS_TARGET;
    PAUSE_DURATION = 2 * FPS_TARGET;

    phases: BossPhase[] = [
        new Boss_CircleChase(this.soundService),
        new Boss_Cross(this.soundService),
        new Boss_VandBoomerangs(this.soundService),
        new Boss_SpiralGaps(this.soundService)
    ];

    assess(){
        this.phaseDefeatFlag = false; //value reset
        if(this.state === bossState.entering){
            if (this.getPhaseTime() > this.ARRIVAL_DURATION) {
                this.hitbox.pos.x = this.DEFAULT_POS.x;
                this.hitbox.pos.y = this.DEFAULT_POS.y;
                this.beginPhase();
            }
        } else if (this.state === bossState.pause) {
            if (this.getPhaseTime() > this.PAUSE_DURATION) {
                this.hitbox.pos.x = this.DEFAULT_POS.x;
                this.hitbox.pos.y = this.DEFAULT_POS.y;
                this.beginPhase();
            }
        } else if (this.state === bossState.attacking){
            //Attack Defeated
            if(this.phases[this.currentPhase].currentHealth <= 0){
                this.moveToNextPhase(true);
                return;
            }

            //Attack Timeout
            if (this.getPhaseTime() >= this.phases[this.currentPhase].DURATION) {
                this.moveToNextPhase(false);
                return;
            }

            //Save the timeout progress to a variable. This variable can be used to display a spellcard timer.
            this.phaseCountdown = ((this.phases[this.currentPhase].DURATION/FPS_TARGET) - Math.round(this.getPhaseTime()/FPS_TARGET)).toFixed(0);
        }
    }

    move() {
        if( this.state === bossState.entering){
            this.moveToDefaultPosition(this.ARRIVAL_DURATION);
        } else if (this.state === bossState.pause){
            this.moveToDefaultPosition(this.PAUSE_DURATION);
        } else {
            this.phases[this.currentPhase].moveScript(this.getPhaseTime(), this.hitbox, this.center);
        }
        this.center = CoordHelper.getCenterWithTopLeftHitbox(this.hitbox);
    }

    attack(): BulletAbstract | BulletAbstract[] | null {
        if (this.state !== bossState.attacking) {
            return null;
        }

        return this.phases[this.currentPhase].attackScript(this.getPhaseTime(), this.center, this.exData.playerPos);
    }

    private moveToDefaultPosition(duration: number) {
        let vel = MovingStuff.moveToDestInSetTime_Decelerate(this.positionPhaseEndedIn.x, this.positionPhaseEndedIn.y, this.DEFAULT_POS.x, this.DEFAULT_POS.y, this.getPhaseTime(), duration);
        this.hitbox.pos.x += vel.x;
        this.hitbox.pos.y += vel.y;
    }

    private beginPhase(){
        this.phaseStartTick = this.exData.now;
        this.positionPhaseEndedIn = {x: this.hitbox.pos.x, y: this.hitbox.pos.y};
        this.state = bossState.attacking;
    }

    private moveToNextPhase(successOrFail: boolean) {
        DrawingStuff.deleteElementFromMemory(this.healthId);
        this.phaseCountdown = '';
        //Trigger bonus points or some other effect if the player was "successful" in the last phase
        if (successOrFail !== undefined) {
            if (successOrFail) {
                console.log(`Phase ${this.currentPhase} defeated.`);
            } else {
                console.log(`Phase ${this.currentPhase} timed out.`);
            }
            this.phaseDefeatFlag = true;
        }

        this.currentPhase++;
        if (this.currentPhase >= this.phases.length) {
            //Flag the boss to be killed.
            this.defeatFlag = true;
            return;
        }

        //Otherwise, we need to pause for a while before the next phase.
        this.phaseStartTick = this.exData.now;
        this.state = bossState.pause
        this.positionPhaseEndedIn = {x: this.hitbox.pos.x, y: this.hitbox.pos.y};
    }

    hitByBullet(bullet: bullet): boolean {
        if (this.state !== bossState.attacking ||
            this.phases[this.currentPhase].currentHealth <= 0
        ) {
            return false;
        }

        this.phases[this.currentPhase].currentHealth -= bullet.damage;
        return true;
    }

    drawThings(ctx: CanvasRenderingContext2D) {
        this.drawHealthCircle(ctx);
        if (DEBUG_MODE) {
            this.debugDrawPath(ctx);
        }
    }

    private drawHealthCircle(ctx: CanvasRenderingContext2D) {
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