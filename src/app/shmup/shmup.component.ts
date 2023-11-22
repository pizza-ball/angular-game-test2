import {
  AfterViewInit,
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Square } from '../helpers/square';
import { leftCoordHitbox, bullet, enemy, point } from '../helpers/interfaces';

const REDGUY_HITBOX_SIZE = 10;

@Component({
  selector: 'app-shmup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shmup.component.html',
  styleUrl: './shmup.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ShmupComponent implements AfterViewInit {
  shmupWidthPx = 515;
  shmupHeightPx = 600;
  redGuyDimPx = { width: 30, height: 50 };
  redGuyPos = { xPos: 245, yPos: 400 };

  redGuyHitBox: leftCoordHitbox = {
    width: REDGUY_HITBOX_SIZE,
    height: REDGUY_HITBOX_SIZE,
    xPos:
      this.redGuyPos.xPos + this.redGuyDimPx.width / 2 - REDGUY_HITBOX_SIZE / 2,
    yPos:
      this.redGuyPos.yPos +
      this.redGuyDimPx.height / 2 -
      REDGUY_HITBOX_SIZE / 2,
  };

  allowedToFire = true;
  vel = 7;

  keysPressed = {
    up: false,
    down: false,
    right: false,
    left: false,
    shoot: false,
  };

  redGuyBullets: bullet[] = [];
  enemies: enemy[] = [];

  stageTimeDisplay = -1;
  tick = 0;

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    this.keyDownHandler(event.key);
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    this.keyUpHandler(event.key);
  }

  ngAfterViewInit() {
    setInterval(() => this.update(), 16);
  }

  update() {
    this.tick++;
    this.timers();
    this.spawnEnemiesOnTimer();
    this.handleMovement();
    this.handleFiring();
    this.moveBullets();
    this.moveEnemies();
    this.checkBulletEnemyCollision();
  }

  timers() {
    if (this.stageTimeDisplay === -1) {
      this.stageTimeDisplay = 0;
      setInterval(() => {
        this.stageTimeDisplay++;
      }, 10);
    }
  }

  keyDownHandler(key: string) {
    if (key === 'd') {
      this.keysPressed.right = true;
    }
    if (key === 'w') {
      this.keysPressed.up = true;
    }
    if (key === 'a') {
      this.keysPressed.left = true;
    }
    if (key === 's') {
      this.keysPressed.down = true;
    }
    if (key === 'k') {
      this.keysPressed.shoot = true;
    }
  }

  keyUpHandler(key: string) {
    if (key === 'd') {
      this.keysPressed.right = false;
    }
    if (key === 'w') {
      this.keysPressed.up = false;
    }
    if (key === 'a') {
      this.keysPressed.left = false;
    }
    if (key === 's') {
      this.keysPressed.down = false;
    }
    if (key === 'k') {
      this.keysPressed.shoot = false;
    }
  }

  handleMovement() {
    let origPosX = this.redGuyPos.xPos;
    let origPosY = this.redGuyPos.yPos;
    let origBoxPosX = this.redGuyHitBox.xPos;
    let origBoxPosY = this.redGuyHitBox.yPos;

    if (this.keysPressed.right) {
      this.redGuyPos.xPos += this.vel;
    }
    if (this.keysPressed.left) {
      this.redGuyPos.xPos -= this.vel;
    }
    if (this.keysPressed.up) {
      this.redGuyPos.yPos -= this.vel;
    }
    if (this.keysPressed.down) {
      this.redGuyPos.yPos += this.vel;
    }

    this.redGuyHitBox.xPos =
      this.redGuyPos.xPos +
      this.redGuyDimPx.width / 2 -
      this.redGuyHitBox.width / 2;
    this.redGuyHitBox.yPos =
      this.redGuyPos.yPos +
      this.redGuyDimPx.height / 2 -
      this.redGuyHitBox.height / 2;

    if (this.redGuyHitBox.xPos + this.redGuyHitBox.width > this.shmupWidthPx) {
      //reset hitbox position to right edge of screen
      this.redGuyHitBox.xPos = this.shmupWidthPx - this.redGuyHitBox.width;
      this.redGuyPos.xPos =
        this.shmupWidthPx -
        this.redGuyDimPx.width / 2 -
        this.redGuyHitBox.width / 2;
    } else if (this.redGuyHitBox.xPos < 0) {
      //reset hitbox position to left edge of screen
      this.redGuyHitBox.xPos = 0;
      this.redGuyPos.xPos =
        0 - this.redGuyDimPx.width / 2 + this.redGuyHitBox.width / 2;
    }
    if (
      this.redGuyHitBox.yPos + this.redGuyHitBox.height >
      this.shmupHeightPx
    ) {
      //reset hitbox position to bottom edge of screen
      this.redGuyHitBox.yPos = this.shmupHeightPx - this.redGuyHitBox.height;
      this.redGuyPos.yPos =
        this.shmupHeightPx -
        this.redGuyDimPx.height / 2 -
        this.redGuyHitBox.height / 2;
    } else if (this.redGuyHitBox.yPos < 0) {
      //reset hitbox position to top edge of screen
      this.redGuyHitBox.yPos = 0;
      this.redGuyPos.yPos =
        0 - this.redGuyDimPx.height / 2 + this.redGuyHitBox.height / 2;
    }
  }

  // temporaryPlayerToEnemyCollide(){
  //   if(this.enemies?.[0] != null){
  //     let playerSquare = new Square();
  //     playerSquare.translateTopLeftCoordHitboxToPoints(this.redGuyHitBox);
  //     let enemySquare = new Square();
  //     enemySquare.translateTopLeftCoordHitboxToPoints(this.enemies[0].hitbox);
  //     return this.checkSquareOverlap(playerSquare, enemySquare);
  //   }
  //   return false;
  // }

  handleFiring() {
    if (this.keysPressed.shoot && this.allowedToFire) {
      setTimeout(() => {
        this.allowedToFire = true;
      }, 50);
      let freshBullet1: bullet = {
        hitbox: {
          xPos: this.redGuyHitBox.xPos - 13,
          yPos: this.redGuyHitBox.yPos + 10,
          width: 15,
          height: 20,
        },
        speed: 16,
        damage: 1,
      };
      let freshBullet2: bullet = {
        hitbox: {
          xPos: this.redGuyHitBox.xPos + 8,
          yPos: this.redGuyHitBox.yPos + 10,
          width: 15,
          height: 20,
        },
        speed: 16,
        damage: 1,
      };
      this.redGuyBullets.push(freshBullet1, freshBullet2);
      this.allowedToFire = false;
    }
  }

  moveBullets() {
    let shouldPop = false;
    this.redGuyBullets.forEach((bullet) => {
      bullet.hitbox.yPos -= bullet.speed;
      if (bullet.hitbox.yPos < -30) {
        shouldPop = true;
      }
    });

    if (shouldPop) {
      this.redGuyBullets.shift();
      this.redGuyBullets.shift();
    }
  }

  spawnEnemiesOnTimer() {
    if (this.tick === 180) {
      let counter = 0;
      let test = setInterval(() => {
        let freshEnemy: enemy = {
          hitbox: {
            xPos: -50,
            yPos: 100,
            width: 80,
            height: 80,
          },
          speed: 3,
          health: 10,
          arrivalSide: 'left',
        };
        this.enemies.push(freshEnemy);
        counter++;
        if (counter === 3) {
          clearInterval(test);
        }
      }, 1000);
    }
  }

  moveEnemies() {
    this.enemies.forEach((enemy, i) => {
      if (enemy.arrivalSide === 'left') {
        enemy.hitbox.xPos += enemy.speed;
      }
      if (enemy.hitbox.xPos > this.shmupWidthPx + 100) {
        this.enemies.splice(i, 1);
      }
    });
  }

  checkBulletEnemyCollision(){
    this.enemies.forEach((enemy, i) => {
      this.redGuyBullets.forEach((bullet, j) => {
        let bulletSquare = new Square(bullet.hitbox);
        let enemySquare = new Square(enemy.hitbox);
        if(Square.checkSquareOverlap(bulletSquare, enemySquare)){
          this.redGuyBullets.splice(j, 1);
          enemy.health -= bullet.damage;
          if(enemy.health <= 0){
            this.enemies.splice(i, 1);
          }
        }
      });
    });
  }
}
