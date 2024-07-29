import { leftCoordHitbox, point } from "../../../../helpers/interfaces";
import { MovingStuff } from "../../../../helpers/moving-stuff";
import { FPS_TARGET, Units } from "../../../globals";
import { SoundService } from "../../../services/sound/sound.service";
import { Boss } from "../../enemies/bosses/boss-abstract";
import { Enemy } from "../../enemies/enemy-abstract";
import { SimpleBullet } from "../simple-bullet";
import { BossPhase } from "./boss-phase";

export class MidBoss1_SpiralGaps implements BossPhase {
    MAX_HEALTH = 400;
    DURATION = 20 * FPS_TARGET;

    currentHealth = this.MAX_HEALTH;
    streamingBullets = new Howl({
        src: [
            this.soundService.specificSoundsDirectory + 'se_tan00.wav',
        ],
    });

    constructor(private soundService: SoundService) { }

    moveScript(tick: number, bossPos: leftCoordHitbox, playerPos: point) {
        return;
    }

    shot1_Tick = Units.secToTick(4);
    shot2_Tick = Units.secToTick(1.5);
    angleToPlayer = 0;
    shot_bossPos = {x: 0, y: 0};
    startAngle = 0;
    attackScript(tick: number, bossPos: point, playerPos: point) {
        this.streamingBullets.volume(this.soundService.quietVol);
        let bullets: SimpleBullet[] = [];

        if ( tick > Units.secToTick(2) &&
            (tick % this.shot1_Tick === 0 ||
            (tick - Units.secToTick(.05)) % this.shot1_Tick === 0 ||
            (tick - Units.secToTick(.1)) % this.shot1_Tick === 0 ||
            (tick - Units.secToTick(.15)) % this.shot1_Tick === 0 ||
            (tick - Units.secToTick(.2)) % this.shot1_Tick === 0 ||
            (tick - Units.secToTick(.25)) % this.shot1_Tick === 0
        )) {
            if (tick % this.shot1_Tick === 0) {
                this.shot_bossPos.x = bossPos.x;
                this.shot_bossPos.y = bossPos.y;
                this.angleToPlayer = MovingStuff.calculateRadianAngleBetweenTwoPoints(this.shot_bossPos.x, this.shot_bossPos.y, playerPos.x, playerPos.y);
            }
            let buls = [
                new SimpleBullet(Object.create(this.shot_bossPos), this.angleToPlayer, Units.getUnits(3), Units.getUnits(10), Units.getUnits(5)),
                new SimpleBullet(Object.create(this.shot_bossPos), this.angleToPlayer - (10) * (Math.PI / 180), Units.getUnits(3), Units.getUnits(10), Units.getUnits(5)),
                new SimpleBullet(Object.create(this.shot_bossPos), this.angleToPlayer + (10) * (Math.PI / 180), Units.getUnits(3), Units.getUnits(10), Units.getUnits(5))
            ];
            for (let bul of buls) {
                bul.configureMaxSpeed(Units.getUnits(4));
            }
            bullets.push(...buls);
            this.streamingBullets.stop();
            this.streamingBullets.play();
        }

        //Offset the tick value to stagger this shot.
        const tOffset = tick - Units.secToTick(2);
        if ((tOffset % this.shot1_Tick === 0 ||
            (tOffset - Units.secToTick(.05)) % this.shot1_Tick === 0 ||
            (tOffset - Units.secToTick(.1)) % this.shot1_Tick === 0 ||
            (tOffset - Units.secToTick(.15)) % this.shot1_Tick === 0 ||
            (tOffset - Units.secToTick(.2)) % this.shot1_Tick === 0 ||
            (tOffset - Units.secToTick(.25)) % this.shot1_Tick === 0 ||
            (tOffset - Units.secToTick(.30)) % this.shot1_Tick === 0 ||
            (tOffset - Units.secToTick(.35)) % this.shot1_Tick === 0
        )) {
            if (tOffset % this.shot1_Tick === 0) {
                this.shot_bossPos.x = bossPos.x;
                this.shot_bossPos.y = bossPos.y;
                this.angleToPlayer = MovingStuff.calculateRadianAngleBetweenTwoPoints(this.shot_bossPos.x, this.shot_bossPos.y, playerPos.x, playerPos.y);
            }
            let buls = [
                new SimpleBullet(Object.create(this.shot_bossPos), this.angleToPlayer - (5) * (Math.PI / 180), Units.getUnits(3), Units.getUnits(10), Units.getUnits(5)),
                new SimpleBullet(Object.create(this.shot_bossPos), this.angleToPlayer + (5) * (Math.PI / 180), Units.getUnits(3), Units.getUnits(10), Units.getUnits(5)),
                new SimpleBullet(Object.create(this.shot_bossPos), this.angleToPlayer - (15) * (Math.PI / 180), Units.getUnits(3), Units.getUnits(10), Units.getUnits(5)),
                new SimpleBullet(Object.create(this.shot_bossPos), this.angleToPlayer + (15) * (Math.PI / 180), Units.getUnits(3), Units.getUnits(10), Units.getUnits(5))
            ];
            for (let bul of buls) {
                bul.configureMaxSpeed(Units.getUnits(4));
                bul.color = "cyan";
            }
            bullets.push(...buls);
            this.streamingBullets.stop();
            this.streamingBullets.play();
        }

        //Create four circles of spinning bullets going in opposing directions.
        //TODO: refactor this. It's uglyyyyyyyyyy but easier to read atm.
        if (
            //tick > 3*FPS_TARGET &&
            tick % this.shot2_Tick === 0) {
            for(let i = 0; i < 360 + this.startAngle; i += 45){
                for(let j = 0; j<4; j++){
                    let bul = new SimpleBullet({x: Units.xFromPct(50), y: Units.yFromPct(30)}, 0);
                    bul.changeToRotational({x: Units.xFromPct(50), y: Units.yFromPct(30)}, Units.getUnits(-30), Units.getUnits(1), (i + this.startAngle)+(j*3), .4);
                    bul.color = "pink";
                    bullets.push(bul);
                }
                for(let j = 0; j<4; j++){
                    let bul = new SimpleBullet({x: Units.xFromPct(50), y: Units.yFromPct(30)}, 0);
                    bul.changeToRotational({x: Units.xFromPct(50), y: Units.yFromPct(30)}, Units.getUnits(10), Units.getUnits(1), (i + this.startAngle)+(j*3), -.4);
                    bul.color = "pink";
                    bullets.push(bul);
                }
                for(let j = 0; j<4; j++){
                    let bul = new SimpleBullet({x: Units.xFromPct(50), y: Units.yFromPct(30)}, 0);
                    bul.changeToRotational({x: Units.xFromPct(50), y: Units.yFromPct(30)}, Units.getUnits(-10), Units.getUnits(1), (i + this.startAngle)+(j*3), .4);
                    bul.color = "pink";
                    bullets.push(bul);
                }
                for(let j = 0; j<4; j++){
                    let bul = new SimpleBullet({x: Units.xFromPct(50), y: Units.yFromPct(30)}, 0);
                    bul.changeToRotational({x: Units.xFromPct(50), y: Units.yFromPct(30)}, Units.getUnits(35), Units.getUnits(1), (i + this.startAngle)+(j*3), -.4);
                    bul.color = "pink";
                    bullets.push(bul);
                }
            }
            this.startAngle += 22;
            // this.streamingBullets.stop();
            // this.streamingBullets.play();
        }

        return bullets;
    }


    spawnScript(tick: number, owner: Boss, playerPos: point): Enemy | Enemy[] | null {
        return null;
    }
}