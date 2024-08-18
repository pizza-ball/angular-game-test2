import { leftCoordHitbox, point } from "../../../../../helpers/interfaces";
import { Helper } from "../../../../../helpers/moving-stuff";
import { FPS_TARGET, Units } from "../../../../globals";
import { SoundService } from "../../../../services/sound/sound.service";
import { Boss } from "../../../enemies/bosses/boss-abstract";
import { Enemy } from "../../../enemies/enemy-abstract";
import { BoundBullet } from "../../bound-bullet";
import { BulletAbstract } from "../../bullet-abstract";
import { Danmaku } from "../../patterns/danmaku";
import { SoloBullet } from "../../solo-bullet";
import { BossPhase } from "../boss-phase";

export class Boss_Cross implements BossPhase{
    MAX_HEALTH = 400;
    DURATION = 30 * FPS_TARGET;

    currentHealth = this.MAX_HEALTH;
    streamingBullets = new Howl({
        src: [
            this.soundService.specificSoundsDirectory + 'se_tan00.wav',
        ],
    });

    constructor(private soundService: SoundService) { }

    tickCounter = 0;
    path: any = null;
    phaseStartPos = {x: 0, y: 0};
    phaseDest = {x: 0, y: 0};
    moveDur = 1*FPS_TARGET;
    moveScript(tick: number, bossPos: leftCoordHitbox, playerPos: point) {
        if(tick > this.moveDur){
            return;
        }
        if(tick === 0){
            this.phaseStartPos.x = bossPos.pos.x;
            this.phaseStartPos.y = bossPos.pos.y;
            this.phaseDest = Helper.getTopLeftWithCenterPoint(bossPos.width, bossPos.height, Units.xFromPct(50), Units.yFromPct(15));
        }
        let vel = Helper.moveToDestInSetTime_Decelerate(this.phaseStartPos.x, this.phaseStartPos.y, this.phaseDest.x, this.phaseDest.y, tick, this.moveDur);
        bossPos.pos.x += vel.x;
        bossPos.pos.y += vel.y;
    }

    shot1_Tick = Units.secToTick(2);
    shot2_Tick = Units.secToTick(.1);
    shot3_Tick = Units.secToTick(1);
    angleToPlayer = 0;
    crossRadius = Units.getUnits(100);
    crossRotationSpeed = 1.5;
    shot2_pct = 5;
    shot2_pctStep = 5;
    attackScript(tick: number, bossPos: point, playerPos: point) {
        this.streamingBullets.volume(this.soundService.quietVol);
        let bullets: BulletAbstract[] = [];

        if (tick > this.moveDur &&
            tick % this.shot1_Tick === 0) {

            let buls = [new SoloBullet(Object.create(bossPos), Helper.degToRad(90), Units.getUnits(1.5), Units.getUnits(10))];
            for (let bul of buls) {
                bul.setAutoDeleted(false);
                for(let i = 0; i < 360; i += 90){
                    for(let j = 0; j < 4; j++){
                        let circBul = new BoundBullet(bul.center, 0);
                        circBul.setAutoDeleted(false);
                        circBul.setCircularMovementData((this.crossRadius/4)*j, 0, i, this.crossRotationSpeed);
                        circBul.color = "pink";
                        circBul.spriteData.sprite = "/assets/bullets/normal/bullets21.png";
                        bullets.push(circBul);
                    }
                }
            }

            bullets.push(...buls);
            this.crossRotationSpeed = -1*this.crossRotationSpeed; //Reverses the direction of rotation for the next shot.
        }

        if (tick % this.shot2_Tick === 0) {
            if(this.shot2_pct >= 25){
                this.shot2_pctStep *= -1;
            } else if(this.shot2_pct < 5) {
                this.shot2_pctStep *= -1;
            }
            this.shot2_pct += this.shot2_pctStep;
            const startPos1 = {x: Units.xFromPct(this.shot2_pct), y: Units.yFromPct(-10)};
            const startPos2 = {x: Units.xFromPct(100-this.shot2_pct), y: Units.yFromPct(-10)};
            const startPos3 = {x: Units.xFromPct(25-this.shot2_pct), y: Units.yFromPct(-10)};
            const startPos4 = {x: Units.xFromPct(100-(25-this.shot2_pct)), y: Units.yFromPct(-10)};
            
            let buls = [
                new SoloBullet(Object.create(startPos1), Helper.degToRad(90), Units.getUnits(2), Units.getUnits(25), Units.getUnits(2)),
                new SoloBullet(Object.create(startPos2), Helper.degToRad(90), Units.getUnits(2), Units.getUnits(25), Units.getUnits(2)),
                new SoloBullet(Object.create(startPos3), Helper.degToRad(90), Units.getUnits(2), Units.getUnits(25), Units.getUnits(2)),
                new SoloBullet(Object.create(startPos4), Helper.degToRad(90), Units.getUnits(2), Units.getUnits(25), Units.getUnits(2))
            ];

            for(let bul of buls){
                bul.setAutoDeleted(false);
            }

            buls[0].color = "cyan";
            buls[0].spriteData.sprite = "/assets/bullets/bubbles/bubble2.png";
            buls[1].color = "cyan";
            buls[1].spriteData.sprite = "/assets/bullets/bubbles/bubble2.png";
            buls[2].spriteData.sprite = "/assets/bullets/bubbles/bubble1.png";
            buls[3].spriteData.sprite = "/assets/bullets/bubbles/bubble1.png";

            bullets.push(...buls);
            this.streamingBullets.stop();
            this.streamingBullets.play();
        }

        if (tick % this.shot3_Tick === 0) {
            const startPos = {x: Units.xFromPct(30+Helper.getRandomPositiveInt(Units.getUnits(40))), y: Units.yFromPct(0)};
            
            let buls = [
                new SoloBullet(Object.create(startPos), Helper.degToRad(90), Units.getUnits(3), Units.getUnits(8)),
            ];

            bullets.push(...buls);
        }

        return bullets;
    }


    spawnScript(tick: number, owner: Boss, playerPos: point): Enemy | Enemy[] | null {
        return null;
    }
}