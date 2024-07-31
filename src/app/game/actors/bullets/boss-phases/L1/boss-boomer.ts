import { leftCoordHitbox, point } from "../../../../../helpers/interfaces";
import { MovingStuff } from "../../../../../helpers/moving-stuff";
import { FPS_TARGET, Units } from "../../../../globals";
import { SoundService } from "../../../../services/sound/sound.service";
import { Boss } from "../../../enemies/bosses/boss-abstract";
import { Enemy } from "../../../enemies/enemy-abstract";
import { SimpleBullet } from "../../simple-bullet";
import { BossPhase } from "../boss-phase";

export class Boss_VandBoomerangs implements BossPhase{
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

    //Spawn aimed bullets at the player, with large gaps between
    //Spawn a wide cone of bullets at the top of the screen, the angles of which close in on the player. Restricts available space.
    shot1Tick = 1 * FPS_TARGET;
    shot2Tick = FPS_TARGET/30; //every 2 frames at 60fps
    shot3Tick = .5 * FPS_TARGET; //every 30 frames
    angle_a = 225;
    angle_b = 315;
    alternater = false;
    rando = 0;
    attackScript(tick: number, bossPos: point, playerPos: point){
        this.streamingBullets.volume(this.soundService.quietVol);
        let bullets: SimpleBullet[] = [];
        if (tick % this.shot1Tick === 0){
            const angleToPlayer = MovingStuff.calculateRadianAngleBetweenTwoPoints(bossPos.x, bossPos.y, playerPos.x, playerPos.y);
            let bul1 = new SimpleBullet(Object.create(bossPos), angleToPlayer, Units.getUnits(8), Units.getUnits(10), Units.getUnits(-16));
            bul1.configureMinSpeed(2);
            bullets.push(bul1);
        }

        if (tick % this.shot2Tick === 0){
            this.streamingBullets.stop();
            this.streamingBullets.play();
            let bul1 = new SimpleBullet(Object.create(bossPos), MovingStuff.degreesToRadians(this.angle_a), Units.getUnits(8));
            let bul2 = new SimpleBullet(Object.create(bossPos), MovingStuff.degreesToRadians(this.angle_b), Units.getUnits(8));
            bul1.color = "cyan";
            bul2.color = "cyan";
            bullets.push(bul1);
            bullets.push(bul2);
            if(this.angle_a > 125){
                this.angle_a -= 2;
            }
            if(this.angle_b < 360+55){
                this.angle_b += 2;
            }
        }

        if (tick > 2.5*FPS_TARGET && 
            (tick % this.shot3Tick === 0 ||
             (tick - FPS_TARGET/20) % this.shot3Tick === 0 ||
             (tick - FPS_TARGET/10) % this.shot3Tick === 0
            )){
            if(tick % this.shot3Tick === 0){
                this.rando = MovingStuff.getRandomPositiveInt(60);
            }
            if(this.alternater){
                let rAngleShot = new SimpleBullet(Object.create(bossPos), MovingStuff.degreesToRadians(270 + this.rando), Units.getUnits(3), Units.getUnits(20), Units.getUnits(2));
                rAngleShot.alterAngleWhenMoving(3.2, 1);
                rAngleShot.color = "pink";
                bullets.push(rAngleShot);
            } else {
                let lAngleShot = new SimpleBullet(Object.create(bossPos), MovingStuff.degreesToRadians(270 - this.rando), Units.getUnits(3), Units.getUnits(20), Units.getUnits(2));
                lAngleShot.alterAngleWhenMoving(-3.2, 1);
                lAngleShot.color = "pink";
                bullets.push(lAngleShot);
            }
            this.soundService.enemyBulletSound.play();
            if((tick - FPS_TARGET/10) % this.shot3Tick === 0){
                this.alternater = !this.alternater;
            }
        }
        return bullets;
    }

    spawnScript(tick: number, owner: Boss, playerPos: point): Enemy | Enemy[] | null {
        return null;
    }
}