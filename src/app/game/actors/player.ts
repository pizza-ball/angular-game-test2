import { DrawingStuff } from "../../helpers/drawing-stuff";
import { bullet, leftCoordHitbox, point } from "../../helpers/interfaces";
import { Square } from "../../helpers/square";
import { DEBUG_MODE } from "../globals";
import { InputService } from "../services/input/input.service";
import { SoundService } from "../services/sound/sound.service";
import { v4 as uuidv4 } from 'uuid';

export enum playerState {
    normal = 'normal',
    dead = 'dead',
    respawning = 'respawning',
    invincible = 'invincible',
}

export class Player {
    public id = uuidv4();
    PLAYSPACE = { width: 1, height: 1 };
    HITBOX_SIZE = 10;
    DIMENSIONS = { width: 30, height: 50 };
    START_POS: point = { x: 245, y: 400 };
    
    position: point = { x: this.START_POS.x, y: this.START_POS.y };
    itemMagnetismRadius = 80;
    hitboxStartPos: point = {
        x: this.getCenterPoint().x - this.HITBOX_SIZE / 2,
        y: this.getCenterPoint().y - this.HITBOX_SIZE / 2,
    };
    hitbox: leftCoordHitbox;
    lives = 3;
    state = playerState.normal;
    allowedToFire = true;
    moveVel = 7;
    focusMoveVel = 3.5;
    power = 0;
    hidden = false;

    constructor(private inputServ: InputService, private soundServ: SoundService, playSpaceWidth: number, playSpaceHeight: number) {
        this.state = playerState.invincible;
        this.hitbox = {
            pos: {
                x: this.hitboxStartPos.x,
                y: this.hitboxStartPos.y,
            },
            width: this.HITBOX_SIZE,
            height: this.HITBOX_SIZE,
        };
        this.PLAYSPACE.width = playSpaceWidth;
        this.PLAYSPACE.height = playSpaceHeight;
    }

    handleMovement() {
        if (this.state === playerState.dead) {
            return;
        }
        
        let speed = this.moveVel;
        if (this.inputServ.actionState.focus.pressed) {
            speed = this.focusMoveVel;
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

        if(this.inputServ.gamepadConnected){
            this.position.x += speed*this.inputServ.leftStick[0];
            this.position.y += speed*this.inputServ.leftStick[1];
        }

        this.hitbox.pos.x =
            this.position.x +
            this.DIMENSIONS.width / 2 -
            this.hitbox.width / 2;
        this.hitbox.pos.y =
            this.position.y +
            this.DIMENSIONS.height / 2 -
            this.hitbox.height / 2;

        this.preventOutOfBounds();
    }

    private preventOutOfBounds() {
        if (this.hitbox.pos.x + this.hitbox.width > this.PLAYSPACE.width) {
            //reset hitbox position to right edge of screen
            this.hitbox.pos.x = this.PLAYSPACE.width - this.hitbox.width;
            this.position.x =
                this.PLAYSPACE.width -
                this.DIMENSIONS.width / 2 -
                this.hitbox.width / 2;
        } else if (this.hitbox.pos.x < 0) {
            //reset hitbox position to left edge of screen
            this.hitbox.pos.x = 0;
            this.position.x =
                0 - this.DIMENSIONS.width / 2 + this.hitbox.width / 2;
        }

        if (
            this.hitbox.pos.y + this.hitbox.height >
            this.PLAYSPACE.height
        ) {
            //reset hitbox position to bottom edge of screen
            this.hitbox.pos.y = this.PLAYSPACE.height - this.hitbox.height;
            this.position.y =
                this.PLAYSPACE.height -
                this.DIMENSIONS.height / 2 -
                this.hitbox.height / 2;
        } else if (this.hitbox.pos.y < 0) {
            //reset hitbox position to top edge of screen
            this.hitbox.pos.y = 0;
            this.position.y =
                0 - this.DIMENSIONS.height / 2 + this.hitbox.height / 2;
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
            let nShotL: bullet = {
                hitbox: {
                    pos: {
                        x: this.hitbox.pos.x - 13,
                        y: this.hitbox.pos.y + 10,
                    },
                    width: 15,
                    height: 20,
                },
                speed: 16,
                damage: 1,
            };
            let nShotR: bullet = {
                hitbox: {
                    pos: {
                        x: this.hitbox.pos.x + 8,
                        y: this.hitbox.pos.y + 10,
                    },
                    width: 15,
                    height: 20,
                },
                speed: 16,
                damage: 1,
            };

            if(this.power > 5){
                let nShotLL: bullet = {
                    hitbox: {
                        pos: {
                            x: nShotL.hitbox.pos.x - 15,
                            y: this.hitbox.pos.y + 10,
                        },
                        width: 7,
                        height: 7,
                    },
                    speed: 8,
                    damage: .5,
                };
                let nShotRR: bullet = {
                    hitbox: {
                        pos: {
                            x: nShotR.hitbox.pos.x + 25,
                            y: this.hitbox.pos.y + 10,
                        },
                        width: 7,
                        height: 7,
                    },
                    speed: 8,
                    damage: .5,
                };
                this.allowedToFire = false;
                return [nShotL, nShotR, nShotLL, nShotRR];
            }

            this.allowedToFire = false;
            return [nShotL, nShotR];
        }
        return null;
    }

    checkBulletPlayerCollision(bullets: any[]) {
        for (let bullet of bullets) {
            let bulletSquare = new Square(bullet.hitbox);
            let playerSquare = new Square(this.hitbox);
            if (
                this.state === playerState.normal &&
                Square.checkSquareOverlap(bulletSquare, playerSquare)
            ) {
                this.killPlayer();
                this.soundServ.playerDeath.play();
            }
        }
    }

    killPlayer() {
        this.state = playerState.respawning;
        this.lives--;
        this.hidden = true;
        if (this.lives > 0) {
            setTimeout(() => {
                this.position.x = this.START_POS.x;
                this.position.y = this.START_POS.y;

                this.hitbox.pos.x = this.hitboxStartPos.x;
                this.hitbox.pos.y = this.hitboxStartPos.y;
                this.hidden = false;
                this.state = playerState.normal;
            }, 2000);
        } else {
            setTimeout(() => {
                this.state = playerState.dead;
            }, 2000);
        }
    }

    debugDrawItemMagnet(ctx: CanvasRenderingContext2D){
        DrawingStuff.deleteElementFromMemory(this.id);
        const center = this.getCenterPoint();
        DrawingStuff.requestCircleDraw(this.id, ctx, center.x, center.y, this.itemMagnetismRadius);
    }

    cleanUp(ctx: CanvasRenderingContext2D){
        if(DEBUG_MODE){
            DrawingStuff.deleteElementFromMemory(this.id);
        }
    }

    getCenterPoint(): point{
        return { x: this.position.x + this.DIMENSIONS.width / 2, y: this.position.y + this.DIMENSIONS.height / 2};
    }
}