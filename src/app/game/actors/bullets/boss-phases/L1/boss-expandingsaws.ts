import { leftCoordHitbox, point } from "../../../../../helpers/interfaces";
import { MovingStuff } from "../../../../../helpers/moving-stuff";
import { FPS_TARGET, Units } from "../../../../globals";
import { SoundService } from "../../../../services/sound/sound.service";
import { Boss } from "../../../enemies/bosses/boss-abstract";
import { Enemy } from "../../../enemies/enemy-abstract";
import { BoundBullet, BoundBullet_MoveType } from "../../bound-bullet";
import { BulletAbstract } from "../../bullet-abstract";
import { SimpleBullet } from "../../simple-bullet";
import { BossPhase } from "../boss-phase";

export class Boss_ExpandingSaws implements BossPhase {
    MAX_HEALTH = 300;
    DURATION = 20 * FPS_TARGET;

    currentHealth = this.MAX_HEALTH;
    streamingBullets = new Howl({
        src: [
            this.soundService.specificSoundsDirectory + 'se_tan00.wav',
        ],
    });

    constructor(private soundService: SoundService) { }

    //Moves the boss to the right, middle, and left, repeat.
    //Movement code is pretty bad, but works. Should be refactored to be more re-usable and less brittle.
    startPos: null | point = null;
    tickCounter = 0;
    path: any = null;
    moveScript(tick: number, bossPos: leftCoordHitbox, playerPos: point) {
        if (this.startPos === null) {
            this.path = MovingStuff.generateRtoLWanderPath(bossPos);
            this.path = [MovingStuff.generateLtoRWanderPath(bossPos)[1], this.path[0], this.path[1]];
            this.startPos = { x: bossPos.pos.x, y: bossPos.pos.y };
        }
        let vel = MovingStuff.moveToDestInSetTime_Decelerate(this.startPos.x, this.startPos.y, this.path[0].dest.x, this.path[0].dest.y, this.tickCounter, this.path[0].time);
        bossPos.pos.x += vel.x;
        bossPos.pos.y += vel.y;
        this.tickCounter++;

        if (this.tickCounter > this.path[0].time) {
            bossPos.pos.x = this.path[0].dest.x;
            bossPos.pos.y = this.path[0].dest.y;
            this.startPos = { x: bossPos.pos.x, y: bossPos.pos.y };
            this.path.splice(0, 1);
            if (this.path.length <= 0) {
                if (bossPos.pos.x < Units.getPlayfieldWidth() * .4) {
                    this.path = MovingStuff.generateLtoRWanderPath(bossPos);
                } else {
                    this.path = MovingStuff.generateRtoLWanderPath(bossPos);
                }
            }
            this.tickCounter = 0;
        }
    }

    shot1_Tick = Units.secToTick(.8);
    angleToPlayer = 0;
    attackScript(tick: number, bossPos: point, playerPos: point) {
        this.streamingBullets.volume(this.soundService.quietVol);
        let bullets: BulletAbstract[] = [];

        if (tick % this.shot1_Tick === 0) {
            this.angleToPlayer = MovingStuff.calculateRadianAngleBetweenTwoPoints(bossPos.x, bossPos.y, playerPos.x, playerPos.y);

            let buls = [
                new SimpleBullet(Object.create(bossPos), this.angleToPlayer, Units.getUnits(0), Units.getUnits(10), Units.getUnits(7)),
                new SimpleBullet(Object.create(bossPos), this.angleToPlayer - (45) * (Math.PI / 180), Units.getUnits(0), Units.getUnits(10), Units.getUnits(7)),
                new SimpleBullet(Object.create(bossPos), this.angleToPlayer + (45) * (Math.PI / 180), Units.getUnits(0), Units.getUnits(10), Units.getUnits(7))
            ];
            for (let bul of buls) {
                bul.configureMaxSpeed(Units.getUnits(9));

                for(let i = 0; i < 360; i += 45){
                    let circBul = new BoundBullet(bul.center, BoundBullet_MoveType.circle);
                    circBul.setCircularMovementData(Units.getUnits(20), Units.getUnits(.15), i, 3);
                    circBul.color = "pink";
                    circBul.spriteData.sprite = "/assets/bullets/normal/bullets20.png"
                    bullets.push(circBul);
                }
            }

            bullets.push(...buls);
            this.streamingBullets.stop();
            this.streamingBullets.play();
        }

        return bullets;
    }


    spawnScript(tick: number, owner: Boss, playerPos: point): Enemy | Enemy[] | null {
        return null;
    }
}