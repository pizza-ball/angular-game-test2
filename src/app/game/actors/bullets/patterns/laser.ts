import { point } from "../../../../helpers/interfaces";
import { Helper } from "../../../../helpers/moving-stuff";
import { Units } from "../../../globals";
import { SoloBullet } from "../solo-bullet";

export class Laser {
    chargeBullet: SoloBullet | null = null;
    laserSpawnPace = Units.secToTick(.04);
    laserAccel = Units.getUnits(35);
    whenToDecayPerc = .8;
    expScaleFactor = 4;
    chargeSprite = "/assets/bullets/normal/bullets24.png"; 
    laserSprite = "/assets/bullets/laser/block9.png";

    //Tick should start at 0. Charge and fire durations should be relative to 0.
    attackScript(tick: number, chargeDur: number, fireDur: number, spawnPos: point, angle: number, size: number){
        let bullets: SoloBullet[] = [];
        if(tick < chargeDur){
            if(this.chargeBullet === null){
                this.chargeBullet = new SoloBullet({x: spawnPos.x, y: spawnPos.y}, Helper.degToRad(angle), 0, Units.getUnits(1), 0);
                this.chargeBullet.spriteData.sprite = this.chargeSprite;
                this.chargeBullet.setAutoDeleted(false);
                this.chargeBullet.overlap = 2;
                bullets.push(this.chargeBullet);
            }
            const charge = this.growExp(size*1.2, tick / chargeDur, this.expScaleFactor); //makes the charge start fast, and smooth out.
            this.chargeBullet.changeSize(charge, charge);
        }else if ((tick-chargeDur) < fireDur && tick % this.laserSpawnPace === 0) {

            let laserSize = size;
            //Starts to shrink all bullets when some percentage finished with firing (whenToDecayPerc)
            if((tick-chargeDur) > (fireDur*this.whenToDecayPerc)){
                const startFrom0 = (tick-chargeDur) - (fireDur*this.whenToDecayPerc);
                laserSize = this.decayLinear(size, startFrom0/(fireDur - fireDur*this.whenToDecayPerc))

                const discharge = this.decayLinear(size*1.2, startFrom0/(fireDur - fireDur*this.whenToDecayPerc));
                this.chargeBullet?.changeSize(discharge, discharge);
                if(discharge < Units.getUnits(4) && this.chargeBullet){
                    this.chargeBullet.flagForDeletion = true;
                }
            }

            let laserBlock = new SoloBullet({x: spawnPos.x, y: spawnPos.y}, Helper.degToRad(angle), 0, laserSize, this.laserAccel);
            laserBlock.spriteData.sprite = this.laserSprite;
            laserBlock.changeHitboxToSpriteScale(1.5);
            laserBlock.configureMaxSpeed(Units.getUnits(15));
            laserBlock.overlap = 1;
            bullets.push(laserBlock);
        }
        return bullets;
    }

    private growExp(maxSize: number, dt: number, k: number){
        return maxSize * (1 - Math.exp(-k * dt));
    }

    private decayExp(maxSize: number, dt: number, k: number){
        return maxSize * Math.exp(-k * dt);
    }

    private decayLinear(maxSize: number, dt: number){
        return maxSize - (maxSize * dt);
    }
}