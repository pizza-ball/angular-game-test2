import { leftCoordHitbox, point } from "../../../../../helpers/interfaces";
import { Helper } from "../../../../../helpers/moving-stuff";
import { FPS_TARGET, Units } from "../../../../globals";
import { SoundService } from "../../../../services/sound/sound.service";
import { Boss } from "../../../enemies/bosses/boss-abstract";
import { Enemy } from "../../../enemies/enemy-abstract";
import { SoloBullet } from "../../solo-bullet";
import { BossPhase } from "../boss-phase";

export class Boss_KunaiCircles implements BossPhase{
    MAX_HEALTH = 300;
    DURATION = 20*FPS_TARGET;

    currentHealth = this.MAX_HEALTH;
    streamingBullets = new Howl({
        src: [
          this.soundService.specificSoundsDirectory + 'se_tan00.wav',
        ],
    });
    
    constructor(private soundService: SoundService){}

    //Moves the boss to the right, middle, and left, repeat.
    //Movement code is pretty bad, but works. Should be refactored to be more re-usable and less brittle.
    startPos: null | point = null;
    tickCounter = 0;
    path: any = null;
    moveScript(tick: number, bossPos: leftCoordHitbox, playerPos: point){
        if(this.startPos === null){
            this.path = Helper.generateRtoLWanderPath(bossPos);
            this.path = [Helper.generateLtoRWanderPath(bossPos)[1], this.path[0], this.path[1]];
            this.startPos = {x: bossPos.pos.x, y: bossPos.pos.y};
        }
        let vel = Helper.moveToDestInSetTime_Decelerate(this.startPos.x, this.startPos.y, this.path[0].dest.x, this.path[0].dest.y, this.tickCounter, this.path[0].time);
        bossPos.pos.x += vel.x;
        bossPos.pos.y += vel.y;
        this.tickCounter++;

        if (this.tickCounter > this.path[0].time) {
            bossPos.pos.x = this.path[0].dest.x;
            bossPos.pos.y = this.path[0].dest.y;
            this.startPos = {x: bossPos.pos.x, y: bossPos.pos.y};
            this.path.splice(0, 1);
            if(this.path.length <= 0){
                if(bossPos.pos.x < Units.getPlayfieldWidth()*.4){
                    this.path = Helper.generateLtoRWanderPath(bossPos);
                } else {
                    this.path = Helper.generateRtoLWanderPath(bossPos);
                }
            }
            this.tickCounter = 0;
        }
    }

    //Spawn a burst of standard bullets at several angles. Bullets aren't very fast, but dense.
    shot1Tick = FPS_TARGET/4; //every 15 frames at 60fps
    alternater = false;
    angle = 0;
    angleIncrement = 72;
    rando = 0;
    shots = 4;
    attackScript(tick: number, bossPos: point, playerPos: point){
        this.streamingBullets.volume(this.soundService.quietVol);
        let bullets: SoloBullet[] = [];

        if (tick % this.shot1Tick === 0){
            if(this.alternater){
                for(let i = this.angle; i < 360 + this.angle; i += this.angleIncrement){
                    let angleClone = i - (3*this.shots);
                    for (let j = 0; j < this.shots; j++) {
                        bullets.push(new SoloBullet(Object.create(bossPos), (Math.PI/180)*angleClone, Units.getUnits(3)));
                        angleClone += 3+this.shots;
                    }
                }
            } else{
                for(let i = -this.angle; i > -360 - this.angle; i -= this.angleIncrement){
                    let angleClone = i - (3*this.shots);
                    for (let j = 0; j < this.shots; j++) {
                        let bul = new SoloBullet(Object.create(bossPos), (Math.PI/180)*angleClone, Units.getUnits(3));
                        bul.color = "cyan";
                        bul.spriteData.sprite = "/assets/bullets/normal/bullets24.png";
                        bullets.push(bul);
                        angleClone += 3+this.shots;
                    }
                }
            }
            this.alternater = !this.alternater;
            this.angle += 20;
            this.streamingBullets.stop();
            this.streamingBullets.play();
        }
        return bullets;
    }

    spawnScript(tick: number, owner: Boss, playerPos: point): Enemy | Enemy[] | null {
        return null;
    }
}