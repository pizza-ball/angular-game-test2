import { leftCoordHitbox, point } from "../../../../helpers/interfaces";
import { MovingStuff } from "../../../../helpers/moving-stuff";
import { TICKS_PER_SECOND } from "../../../globals";
import { SoundService } from "../../../services/sound/sound.service";
import { SimpleBullet } from "../simple-bullet";
import { BossPhase } from "./boss-phase";

export class Boss1_VandBoomerangs implements BossPhase{
    MAX_HEALTH = 300;
    DURATION = 30*TICKS_PER_SECOND;

    currentHealth = this.MAX_HEALTH;
    streamingBullets = new Howl({
        src: [
          this.soundService.specificSoundsDirectory + 'se_tan00.wav',
        ],
    });
    
    constructor(private soundService: SoundService){}

    move(tick: number, bossPos: leftCoordHitbox, playerPos: point){
        return;
    }

    //Spawn aimed bullets at the player, with large gaps between
    //Spawn a wide cone of bullets at the top of the screen, the angles of which close in on the player. Restricts available space.
    b_shot1Tick = 1 * TICKS_PER_SECOND;
    b_shot2Tick = TICKS_PER_SECOND/30; //every 2 frames at 60fps
    b_shot3Tick = .5 * TICKS_PER_SECOND; //every 30 frames
    angle_a = 225;
    angle_b = 315;
    alternater = false;
    rando = 0;
    shoot(tick: number, bossPos: point, playerPos: point){
        this.streamingBullets.volume(this.soundService.quietVol);
        let bullets: SimpleBullet[] = [];
        if (tick % this.b_shot1Tick === 0){
            const angleToPlayer = MovingStuff.calculateRadianAngleBetweenTwoPoints(bossPos.x, bossPos.y, playerPos.x, playerPos.y);
            let bul1 = new SimpleBullet(Object.create(bossPos), angleToPlayer, 8, 10, -16);
            bul1.configureMinSpeed(2);
            bullets.push(bul1);
        }

        if (tick % this.b_shot2Tick === 0){
            this.streamingBullets.stop();
            this.streamingBullets.play();
            let bul1 = new SimpleBullet(Object.create(bossPos), MovingStuff.degreesToRadians(this.angle_a), 8);
            let bul2 = new SimpleBullet(Object.create(bossPos), MovingStuff.degreesToRadians(this.angle_b), 8);
            bullets.push(bul1);
            bullets.push(bul2);
            if(this.angle_a > 125){
                this.angle_a -= 2;
            }
            if(this.angle_b < 360+55){
                this.angle_b += 2;
            }
        }

        if (tick > 2.5*TICKS_PER_SECOND && 
            (tick % this.b_shot3Tick === 0 ||
             (tick - TICKS_PER_SECOND/20) % this.b_shot3Tick === 0 ||
             (tick - TICKS_PER_SECOND/10) % this.b_shot3Tick === 0
            )){
            if(tick % this.b_shot3Tick === 0){
                this.rando = MovingStuff.getRandomPositiveInt(60);
            }
            if(this.alternater){
                let rAngleShot = new SimpleBullet(Object.create(bossPos), MovingStuff.degreesToRadians(270 + this.rando), 3, 20, 2);
                rAngleShot.alterAngleWhenMoving(3.2, 1);
                bullets.push(rAngleShot);
            } else {
                let lAngleShot = new SimpleBullet(Object.create(bossPos), MovingStuff.degreesToRadians(270 - this.rando), 3, 20, 2);
                lAngleShot.alterAngleWhenMoving(-3.2, 1);
                bullets.push(lAngleShot);
            }
            this.soundService.enemyBulletSound.play();
            if((tick - TICKS_PER_SECOND/10) % this.b_shot3Tick === 0){
                this.alternater = !this.alternater;
            }
        }
        return bullets;
    }
}