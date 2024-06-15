import { bullet, enemyBullet, leftCoordHitbox } from "../../helpers/interfaces";
import { Square } from "../../helpers/square";
import { InputService } from "../services/input/input.service";
import { SoundService } from "../services/sound/sound.service";

export enum playerState {
    normal = 'normal',
    dead = 'dead',
    respawning = 'respawning',
    invincible = 'invincible',
}

export class Player {

    PLAYSPACE = { width: 1, height: 1 };
    HITBOX_SIZE = 10;
    DIMENSIONS = { width: 30, height: 50 };
    START_POS = { x: 245, y: 400 };

    position = { xPos: this.START_POS.x, yPos: this.START_POS.y };
    hitboxStartPos = {
        x:
            this.position.xPos + this.DIMENSIONS.width / 2 - this.HITBOX_SIZE / 2,
        y:
            this.position.yPos +
            this.DIMENSIONS.height / 2 -
            this.HITBOX_SIZE / 2,
    };
    hitbox: leftCoordHitbox;
    lives = 3;
    state = playerState.normal;
    allowedToFire = true;
    moveVel = 7;
    hidden = false;

    constructor(private inputServ: InputService, private soundServ: SoundService, playSpaceWidth: number, playSpaceHeight: number) {
        this.state = playerState.normal;
        this.hitbox = {
            width: this.HITBOX_SIZE,
            height: this.HITBOX_SIZE,
            xPos: this.hitboxStartPos.x,
            yPos: this.hitboxStartPos.y,
        };
        this.PLAYSPACE.width = playSpaceWidth;
        this.PLAYSPACE.height = playSpaceHeight;
    }

    handleMovement() {
        if (this.state !== playerState.normal) {
            return;
        }

        if (this.inputServ.keysDown.right) {
            this.position.xPos += this.moveVel;
        }
        if (this.inputServ.keysDown.left) {
            this.position.xPos -= this.moveVel;
        }
        if (this.inputServ.keysDown.up) {
            this.position.yPos -= this.moveVel;
        }
        if (this.inputServ.keysDown.down) {
            this.position.yPos += this.moveVel;
        }

        this.hitbox.xPos =
            this.position.xPos +
            this.DIMENSIONS.width / 2 -
            this.hitbox.width / 2;
        this.hitbox.yPos =
            this.position.yPos +
            this.DIMENSIONS.height / 2 -
            this.hitbox.height / 2;

        this.preventOutOfBounds();
    }

    private preventOutOfBounds() {
        if (this.hitbox.xPos + this.hitbox.width > this.PLAYSPACE.width) {
            //reset hitbox position to right edge of screen
            this.hitbox.xPos = this.PLAYSPACE.width - this.hitbox.width;
            this.position.xPos =
                this.PLAYSPACE.width -
                this.DIMENSIONS.width / 2 -
                this.hitbox.width / 2;
        } else if (this.hitbox.xPos < 0) {
            //reset hitbox position to left edge of screen
            this.hitbox.xPos = 0;
            this.position.xPos =
                0 - this.DIMENSIONS.width / 2 + this.hitbox.width / 2;
        }

        if (
            this.hitbox.yPos + this.hitbox.height >
            this.PLAYSPACE.height
        ) {
            //reset hitbox position to bottom edge of screen
            this.hitbox.yPos = this.PLAYSPACE.height - this.hitbox.height;
            this.position.yPos =
                this.PLAYSPACE.height -
                this.DIMENSIONS.height / 2 -
                this.hitbox.height / 2;
        } else if (this.hitbox.yPos < 0) {
            //reset hitbox position to top edge of screen
            this.hitbox.yPos = 0;
            this.position.yPos =
                0 - this.DIMENSIONS.height / 2 + this.hitbox.height / 2;
        }
    }

    playerFiring(): bullet[] | null {
        if (
            this.inputServ.keysDown.shoot &&
            this.allowedToFire &&
            this.state === playerState.normal
        ) {
            setTimeout(() => {
                this.allowedToFire = true;
            }, 50);
            let nShotL: bullet = {
                hitbox: {
                    xPos: this.hitbox.xPos - 13,
                    yPos: this.hitbox.yPos + 10,
                    width: 15,
                    height: 20,
                },
                speed: 16,
                damage: 1,
            };
            let nShotR: bullet = {
                hitbox: {
                    xPos: this.hitbox.xPos + 8,
                    yPos: this.hitbox.yPos + 10,
                    width: 15,
                    height: 20,
                },
                speed: 16,
                damage: 1,
            };
            this.allowedToFire = false;
            return [nShotL, nShotR];
        }
        return null;
    }

    checkBulletPlayerCollision(bullets: enemyBullet[]) {
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
                this.position.xPos = this.START_POS.x;
                this.position.yPos = this.START_POS.y;

                this.hitbox.xPos = this.hitboxStartPos.x;
                this.hitbox.yPos = this.hitboxStartPos.y;
                this.hidden = false;
                this.state = playerState.normal;
            }, 2000);
        } else {
            setTimeout(() => {
                this.state = playerState.dead;
            }, 2000);
        }
    }
}