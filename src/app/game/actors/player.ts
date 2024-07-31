import { CoordHelper } from "../../helpers/coords";
import { DrawingStuff } from "../../helpers/drawing-stuff";
import { bullet, leftCoordHitbox, leftCoordHitboxId, point } from "../../helpers/interfaces";
import { MovingStuff } from "../../helpers/moving-stuff";
import { Square } from "../../helpers/square";
import { DEBUG_MODE, FPS_TARGET, Units } from "../globals";
import { InputService } from "../services/input/input.service";
import { SoundService } from "../services/sound/sound.service";
import { v4 as uuidv4 } from 'uuid';
import { ActorList } from "./actorlist";

export enum playerState {
    normal = 'normal',
    dead = 'dead',
    respawning = 'respawning',
    invincible = 'invincible',
    gameover = 'gameover'
}

export class Player {
    public id = uuidv4();
    DEFAULT_COLOR = "rgb(236, 129, 129)";
    PLAYSPACE = { width: 1, height: 1 };
    WIDTH = Units.getUnits(5);
    HEIGHT = Units.getUnits(5);
    SPRITE_DIMENSIONS = { width: Units.getUnits(30), height: Units.getUnits(50) };
    START_POS: point = { x: Units.getPlayfieldWidth()/2, y: Units.getPlayfieldHeight()*.8 };
    HITBOX_START_POS: point = {
        x: CoordHelper.getCenterWithTopLeftPoint(this.SPRITE_DIMENSIONS.width, this.SPRITE_DIMENSIONS.height, this.START_POS.x, this.START_POS.y).x - this.WIDTH / 2,
        y: CoordHelper.getCenterWithTopLeftPoint(this.SPRITE_DIMENSIONS.width, this.SPRITE_DIMENSIONS.height, this.START_POS.x, this.START_POS.y).y - this.HEIGHT / 2,
    };
    RESPAWN_TIME = 3 * FPS_TARGET;
    DEFAULT_ITEMMAG_RADIUS = Units.getUnits(80);

    position: point = { x: this.START_POS.x, y: this.START_POS.y };
    center: point = { x: 0, y: 0 };
    hitbox: leftCoordHitbox;
    lives = 3;
    state = playerState.normal;
    color = this.DEFAULT_COLOR; //Color can change based on player state
    allowedToFire = true;
    moveVel = Units.getUnits(5);
    focusMoveVel = Units.getUnits(2.5);
    focusing = false;
    power = 0;
    score = 0;
    hidden = false;
    itemMagnetismRadius = this.DEFAULT_ITEMMAG_RADIUS;
    respawnCounter = 0;
    powerOptions: any[] = [];

    constructor(private inputServ: InputService, private soundServ: SoundService, playSpaceWidth: number, playSpaceHeight: number) {
        //this.state = playerState.invincible;
        this.hitbox = {
            pos: {
                x: this.HITBOX_START_POS.x,
                y: this.HITBOX_START_POS.y,
            },
            width: this.WIDTH,
            height: this.HEIGHT,
        };
        this.PLAYSPACE.width = playSpaceWidth;
        this.PLAYSPACE.height = playSpaceHeight;

        this.center = CoordHelper.getCenterWithTopLeftHitbox(this.hitbox);
    }

    handleMovement() {
        if (this.state === playerState.dead) {
            return;
        }

        if (this.state === playerState.respawning) {
            this.respawnCounter++;
            if (this.respawnCounter > this.RESPAWN_TIME) {
                this.state = playerState.normal;
                this.color = this.DEFAULT_COLOR;
                this.respawnCounter = 0;
            }
        }

        let speed = this.moveVel;
        this.focusing = false;
        if (this.inputServ.actionState.focus.pressed) {
            speed = this.focusMoveVel;
            this.focusing = true;
        }
        if (this.inputServ.actionState.moveRight.pressed) {
            this.position.x += speed;
        }
        if (this.inputServ.actionState.moveLeft.pressed) {
            this.position.x -= speed;
        }
        if (this.inputServ.actionState.moveUp.pressed) {
            this.position.y -= speed;
        }
        if (this.inputServ.actionState.moveDown.pressed) {
            this.position.y += speed;
        }

        if (this.inputServ.gamepadConnected) {
            this.position.x += speed * this.inputServ.leftStick[0];
            this.position.y += speed * this.inputServ.leftStick[1];
        }

        this.hitbox.pos.x =
            this.position.x +
            this.SPRITE_DIMENSIONS.width / 2 -
            this.hitbox.width / 2;
        this.hitbox.pos.y =
            this.position.y +
            this.SPRITE_DIMENSIONS.height / 2 -
            this.hitbox.height / 2;

        this.center = CoordHelper.getCenterWithTopLeftHitbox(this.hitbox);

        this.checkIfAboveItemCollectionLine();
        this.moveOptions();

        this.preventOutOfBounds();
    }

    checkIfAboveItemCollectionLine() {
        if (this.hitbox.pos.y < Units.getPlayfieldHeight() * .3) {
            this.itemMagnetismRadius = Units.getUnits(2000);
        } else {
            this.itemMagnetismRadius = this.DEFAULT_ITEMMAG_RADIUS;
        }
    }

    private preventOutOfBounds() {
        if (this.hitbox.pos.x + this.hitbox.width > this.PLAYSPACE.width) {
            //reset hitbox position to right edge of screen
            this.hitbox.pos.x = this.PLAYSPACE.width - this.hitbox.width;
            this.position.x =
                this.PLAYSPACE.width -
                this.SPRITE_DIMENSIONS.width / 2 -
                this.hitbox.width / 2;
        } else if (this.hitbox.pos.x < 0) {
            //reset hitbox position to left edge of screen
            this.hitbox.pos.x = 0;
            this.position.x =
                0 - this.SPRITE_DIMENSIONS.width / 2 + this.hitbox.width / 2;
        }

        if (
            this.hitbox.pos.y + this.hitbox.height >
            this.PLAYSPACE.height
        ) {
            //reset hitbox position to bottom edge of screen
            this.hitbox.pos.y = this.PLAYSPACE.height - this.hitbox.height;
            this.position.y =
                this.PLAYSPACE.height -
                this.SPRITE_DIMENSIONS.height / 2 -
                this.hitbox.height / 2;
        } else if (this.hitbox.pos.y < 0) {
            //reset hitbox position to top edge of screen
            this.hitbox.pos.y = 0;
            this.position.y =
                0 - this.SPRITE_DIMENSIONS.height / 2 + this.hitbox.height / 2;
        }
    }

    playerFiring(): bullet[] | null {
        if (
            this.inputServ.actionState.shoot.pressed &&
            this.allowedToFire &&
            this.state !== playerState.dead
        ) {
            setTimeout(() => {
                this.allowedToFire = true;
            }, 50);
            let bulletsFired = [];
            let nShotL: bullet = {
                hitbox: {
                    pos: {
                        x: this.hitbox.pos.x - Units.getUnits(17),
                        y: this.hitbox.pos.y + Units.getUnits(10),
                    },
                    width: Units.getUnits(15),
                    height: Units.getUnits(20),
                },
                speed: Units.getUnits(16),
                damage: 1,
            };
            bulletsFired.push(nShotL);
            let nShotR: bullet = {
                hitbox: {
                    pos: {
                        x: this.hitbox.pos.x + Units.getUnits(7),
                        y: this.hitbox.pos.y + Units.getUnits(10),
                    },
                    width: Units.getUnits(15),
                    height: Units.getUnits(20),
                },
                speed: Units.getUnits(16),
                damage: 1,
            };
            bulletsFired.push(nShotR);

            //Check if any options exist, and allow them to fire.
            for(let i = 0; i < this.powerOptions.length; i++){
                let option = this.powerOptions[i];

                //shoot a bullet from the position of this option
                let center = CoordHelper.getCenterWithTopLeftHitbox(option);
                let optionShot: bullet = {
                    hitbox: {
                        pos: {
                            x: center.x - Units.getUnits(2),
                            y: center.y - Units.getUnits(20),
                        },
                        width: Units.getUnits(4),
                        height: Units.getUnits(20),
                    },
                    speed: Units.getUnits(12),
                    damage: .2,
                };
                bulletsFired.push(optionShot);
            }



            this.allowedToFire = false;
            return bulletsFired;
        }
        return null;
    }

    checkBulletPlayerCollision(bullets: any[], deathSprites: leftCoordHitboxId[]) {
        for (let bullet of bullets) {
            let bulletSquare = new Square(bullet.hitbox);
            let playerSquare = new Square(this.hitbox);
            if (
                this.state === playerState.normal &&
                Square.checkSquareOverlap(bulletSquare, playerSquare)
            ) {
                this.killPlayer(deathSprites);
                this.soundServ.playerDeath.play();
            }
        }
    }

    killPlayer(deathSprites: leftCoordHitboxId[]) {
        this.state = playerState.dead;
        this.lives--;
        this.hidden = true;

        let hitboxCopy = {
            id: ActorList.Player,
            pos: { x: this.hitbox.pos.x, y: this.hitbox.pos.y },
            width: this.hitbox.width,
            height: this.hitbox.height,
        };
        deathSprites.push(hitboxCopy);

        if (this.lives > 0) {
            setTimeout(() => {
                this.respawnPlayer();
            }, 2000);
        } else {
            this.state = playerState.gameover;
        }
    }

    private respawnPlayer() {
        this.position.x = this.START_POS.x;
        this.position.y = this.START_POS.y;

        this.hitbox.pos.x = this.HITBOX_START_POS.x;
        this.hitbox.pos.y = this.HITBOX_START_POS.y;
        this.hidden = false;
        this.state = playerState.respawning;
        this.color = "pink";
    }

    optionDistFromPlayer = Units.getUnits(60);
    MIN_DIST = Units.getUnits(30);
    MAX_DIST = Units.getUnits(70);
    moveOptions(){
        for(let i = 0; i < this.powerOptions.length; i++){
            let option = this.powerOptions[i];
            //Move the angle x amount of degrees and recalculate XY position with it
            option.relAngle += 3;
            if(option.relAngle > 360){
                option.relAngle -= 360;
            }

            if(this.focusing){
                this.optionDistFromPlayer = this.optionDistFromPlayer > this.MIN_DIST ? this.optionDistFromPlayer -= Units.getUnits(5) : this.MIN_DIST;
            } else {
                this.optionDistFromPlayer = this.optionDistFromPlayer < this.MAX_DIST ? this.optionDistFromPlayer += Units.getUnits(5) : this.MAX_DIST;
            }

            const positionModifiers = MovingStuff.calcPointOnCircle_Degrees(option.relAngle, this.optionDistFromPlayer);
            option.pos.x = this.center.x + positionModifiers.x - (option.width/2);
            option.pos.y = this.center.y + positionModifiers.y - (option.height/2);
        }
    }

    adjustPowerLevel(adjustmentValue: number){

        if(this.power === 4){
            //could increase points by some amount instead
            return;
        }

        //Losing power. Reset to a lower level.
        if(adjustmentValue < 0){
            this.power += adjustmentValue;
            this.powerOptions = [];
            if(this.power >= 3){
                this.powerOptions[0] = this.generateOption(45);
                this.powerOptions[1] = this.generateOption(165);
                this.powerOptions[2] = this.generateOption(285);
            } else if(this.power >= 2){
                this.powerOptions[0] = this.generateOption(90);
                this.powerOptions[1] = this.generateOption(270);
            } else if(this.power >= 1){
                this.powerOptions[0] = this.generateOption(90);
            }
            return;
        }

        //Must check if adding values results in a jump to a new integer, otherwise we'll constantly reset the options.
        if(this.power < 1 && this.power + adjustmentValue > 1){
            this.soundServ.powerUp.play();
            this.powerOptions[0] = this.generateOption(90);
        } else if(this.power < 2 && this.power + adjustmentValue > 2){
            this.soundServ.powerUp.play();
            this.powerOptions[0] = this.generateOption(90);
            this.powerOptions[1] = this.generateOption(270);
        } else if(this.power < 3 && this.power + adjustmentValue > 3){
            this.soundServ.powerUp.play();
            this.powerOptions[0] = this.generateOption(45);
            this.powerOptions[1] = this.generateOption(165);
            this.powerOptions[2] = this.generateOption(285);
        } else if(this.power < 4 && this.power + adjustmentValue > 4){
            this.soundServ.powerUp.play();
            this.powerOptions[0] = this.generateOption(90);
            this.powerOptions[1] = this.generateOption(270);
            this.powerOptions[2] = this.generateOption(180);
            this.powerOptions[3] = this.generateOption(0);
            this.power = 4;
            adjustmentValue = 0;
        }

        this.power += adjustmentValue;
    }

    generateOption(startAngle: number){
        return {
            pos: {x: Units.getUnits(-10), y: Units.getUnits(-10)},
            width: Units.getUnits(10),
            height: Units.getUnits(10),
            relAngle: startAngle
        };
    }

    debugDrawItemMagnet(ctx: CanvasRenderingContext2D) {
        DrawingStuff.deleteElementFromMemory(this.id);
        DrawingStuff.requestCircleDraw(this.id, ctx, this.center.x, this.center.y, this.itemMagnetismRadius);
    }

    cleanUp(ctx: CanvasRenderingContext2D) {
        if (DEBUG_MODE) {
            DrawingStuff.deleteElementFromMemory(this.id);
        }
    }
}