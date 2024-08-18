import { leftCoordHitbox, point } from "../../../../../helpers/interfaces";
import { Helper } from "../../../../../helpers/moving-stuff";
import { FPS_TARGET, Units } from "../../../../globals";
import { SoundService } from "../../../../services/sound/sound.service";
import { Boss } from "../../../enemies/bosses/boss-abstract";
import { Enemy } from "../../../enemies/enemy-abstract";
import { SoloBullet } from "../../solo-bullet";
import { BossPhase } from "../boss-phase";

export class Boss_CircleChase implements BossPhase {
    MAX_HEALTH = 300;
    DURATION = 30*FPS_TARGET;

    currentHealth = this.MAX_HEALTH;
    streamingBullets = new Howl({
        src: [
          this.soundService.specificSoundsDirectory + 'se_tan00.wav',
        ],
    });

    constructor(private soundService: SoundService){}

    moveScript(tick: number, bossPos: leftCoordHitbox, playerPos: point){
        return;
    }

    //Spawn bullets at 20 degree increments up to 360. rotate all angles 45*, repeat. spawn every 1 second.
    //Spawn a continuous stream at the player. Forces them to move around the boss.
    startAngle = 0;
    angleIncrement = 30;
    shot1Tick = 1 * FPS_TARGET;
    shot2Tick = FPS_TARGET/15; //every 4 frames at 60fps
    attackScript(tick: number, bossPos: point, playerPos: point) {
        this.streamingBullets.volume(this.soundService.quietVol);
        let bullets: SoloBullet[] = [];
        if (tick % this.shot1Tick === 0){
            for(let i = 0; i < 360 + this.startAngle; i += this.angleIncrement){
                bullets.push(new SoloBullet(Object.create(bossPos), Helper.degToRad(i + this.startAngle), Units.getUnits(1.5)));
            }
            this.startAngle += 45;
        }

        if (tick % this.shot2Tick === 0){
            this.streamingBullets.stop();
            this.streamingBullets.play();
            const angleToPlayer = Helper.calculateRadianAngleBetweenTwoPoints(bossPos.x, bossPos.y, playerPos.x, playerPos.y);
            let bul = new SoloBullet(Object.create(bossPos), angleToPlayer, Units.getUnits(3));
            bul.color = "cyan";
            bullets.push(bul);
        }
        return bullets;
    }
    
    spawnScript(tick: number, owner: Boss, playerPos: point): Enemy | Enemy[] | null {
        return null;
    }
}