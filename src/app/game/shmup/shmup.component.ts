import {
  AfterViewInit,
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Square } from '../../helpers/square';
import {
  leftCoordHitbox,
  bullet,
  enemy,
  point,
  destination,
  enemyBullet,
  bulletBehavior,
} from '../../helpers/interfaces';
import { FormsModule } from '@angular/forms';
import { InputService } from '../services/input/input.service';
import { SoundService } from '../services/sound/sound.service';
import { Enemy, LinearMovementEnemy } from '../../helpers/enemies';
import { MovingStuff } from '../../helpers/moving-stuff';
const REDGUY_HITBOX_SIZE = 10;
const REDGUY_START_POS = { x: 245, y: 400 };

enum playerState {
  normal = 'normal',
  dead = 'dead',
  respawning = 'respawning',
  invincible = 'invincible',
}

@Component({
  selector: 'app-shmup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shmup.component.html',
  styleUrl: './shmup.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ShmupComponent implements AfterViewInit {
  gamePaused = false;
  shmupWidthPx = 515;
  shmupHeightPx = 600;
  redGuyDimPx = { width: 30, height: 50 };
  redGuyPos = { xPos: REDGUY_START_POS.x, yPos: REDGUY_START_POS.y };
  redGuyHitboxStartPos = {
    x:
      this.redGuyPos.xPos + this.redGuyDimPx.width / 2 - REDGUY_HITBOX_SIZE / 2,
    y:
      this.redGuyPos.yPos +
      this.redGuyDimPx.height / 2 -
      REDGUY_HITBOX_SIZE / 2,
  };
  redGuyLives = 3;
  redGuyState = playerState.normal;

  redGuyHitBox: leftCoordHitbox = {
    width: REDGUY_HITBOX_SIZE,
    height: REDGUY_HITBOX_SIZE,
    xPos: this.redGuyHitboxStartPos.x,
    yPos: this.redGuyHitboxStartPos.y,
  };
  volumeSliderChoice = 20;

  allowedToFire = true;
  vel = 7;

  redGuyBullets: bullet[] = [];
  enemies: Enemy[] = [];
  enemyBullets: enemyBullet[] = [];

  stageTimeDisplay = -1;
  tick = 0;
  tickCountLastSecond = 0;
  frameRate = 0;
  animationState = 'running';

  constructor(public inputServ: InputService, public soundServ: SoundService) {}

  async ngAfterViewInit() {
    await this.waitForSoundsToLoad();
    this.soundServ.playMusic('L1');
    this.inputServ.$paused.subscribe((val) => {
      this.gamePaused = val;
      this.soundServ.toggleMusicPause(val);
    });
    setInterval(() => this.update(), 16);
    setInterval(() => this.countFrameRate(), 1000);
  }

  async waitForSoundsToLoad() {
    return await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (this.soundServ.isLevel1SoundLoaded()) {
          console.log('Music Loading complete');
          resolve('done loading music');
          clearInterval(interval);
        }
      }, 1000);
    });
  }

  countFrameRate() {
    this.frameRate = this.tick - this.tickCountLastSecond;
    this.tickCountLastSecond = this.tick;
  }

  update() {
    this.animationState = this.gamePaused ? 'paused' : 'running';
    if (!this.gamePaused) {
      this.soundServ.setVolume(this.volumeSliderChoice);
      this.tick++;
      this.timers();
      this.spawnEnemiesOnTimer();
      this.handleMovement();
      this.handleFiring();
      this.moveBullets();
      this.moveEnemies();
      this.checkBulletEnemyCollision();
      this.checkBulletPlayerCollision();
    }
  }

  timers() {
    if (this.stageTimeDisplay === -1) {
      this.stageTimeDisplay = 0;
      setInterval(() => {
        this.stageTimeDisplay++;
      }, 10);
    }
  }

  handleMovement() {
    if(this.redGuyState !== playerState.normal){
      return;
    }
    
    if (this.inputServ.keysDown.right) {
      this.redGuyPos.xPos += this.vel;
    }
    if (this.inputServ.keysDown.left) {
      this.redGuyPos.xPos -= this.vel;
    }
    if (this.inputServ.keysDown.up) {
      this.redGuyPos.yPos -= this.vel;
    }
    if (this.inputServ.keysDown.down) {
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

    this.preventOutOfBounds();
  }

  private preventOutOfBounds() {
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
    if (this.inputServ.keysDown.shoot && this.allowedToFire && this.redGuyState === playerState.normal) {
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
      this.soundServ.shootingSound.play();
    }

    //Handle enemy firing
    this.enemies.forEach((enemy) => {
      if (enemy.checkToFire(this.tick)) {

        let target: point = {x: 0, y: 0};
        if(enemy.shotType === bulletBehavior.atPlayer){
          target = { x: this.redGuyHitBox.xPos, y: this.redGuyHitBox.yPos };
        } else if (enemy.shotType === bulletBehavior.atPoint){
          target = { x: enemy.shootWhere.x, y: enemy.shootWhere.y };
        }

        let newBullet: enemyBullet = {
          hitbox: {
            xPos: enemy.hitbox.xPos + enemy.hitbox.width / 2,
            yPos: enemy.hitbox.yPos + enemy.hitbox.height,
            width: 10,
            height: 10,
          },
          speed: 3,
          damage: 1,
          xyVel: { x: 0, y: 0 },
          destination: target,
          behavior: enemy.shotType,
        };
        const bulletPoint = {
          x: newBullet.hitbox.xPos,
          y: newBullet.hitbox.yPos,
        };
        const dest = { x: newBullet.destination.x, y: newBullet.destination.y };
        newBullet.xyVel = MovingStuff.getXYVelocityTowardDestWithGivenSpeed(
          newBullet.speed,
          bulletPoint,
          dest
        );
        this.enemyBullets.push(newBullet);
        this.soundServ.enemyBulletSound.play();
      }
    });
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

    //Handle enemy bullet paths
    this.enemyBullets.forEach((bullet) => {
      if (bullet.behavior === bulletBehavior.atPoint || bullet.behavior === bulletBehavior.atPlayer ) {
        bullet.hitbox.xPos += bullet.xyVel.x;
        bullet.hitbox.yPos += bullet.xyVel.y;
      }
    });
  }

  spawnEnemiesOnTimer() {
    if (this.tick === 180 || this.tick === 240 || this.tick === 300) {
      const rightSide: destination = { loc: { x: 400, y: 200 }};
      const up: destination = { loc: { x: 400, y: 100 }};
      const leave: destination = { loc: { x: -100, y: 100 }};
      let leftToRighter = new LinearMovementEnemy(
        [rightSide, up, leave],
        [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6],
        this.tick,
        bulletBehavior.atPlayer,
      );
      leftToRighter.changeStartingPos(-90, 200);
      this.enemies.push(leftToRighter);
    }

    if (this.tick === 540){
      const fromAboveL: destination = { loc: { x: 150, y: 100 }, speed: 8, timeAtDestMs: 5000};
      const leaveL: destination = { loc: { x: 150, y: 1000 }, speed: 4};
      const fromAboveR: destination = { loc: { x: this.shmupWidthPx-150, y: 100 }, speed: 8, timeAtDestMs: 5000};
      const leaveR: destination = { loc: { x: this.shmupWidthPx-150, y: 1000 }, speed: 4};
      let topToBottomL = new LinearMovementEnemy(
        [fromAboveL, leaveL],
        [1, 1.5, 2, 2.5, 3, 3.5, 4],
        this.tick,
        bulletBehavior.atPoint,
        {x:150, y:1000},
      );
      let topToBottomR = new LinearMovementEnemy(
        [fromAboveR, leaveR],
        [1, 1.5, 2, 2.5, 3, 3.5, 4],
        this.tick,
        bulletBehavior.atPoint,
        {x:this.shmupWidthPx-150, y:1000},
      );
      topToBottomL.changeStartingPos(150, -90);
      topToBottomR.changeStartingPos(this.shmupWidthPx-150, -90);
      this.enemies.push(topToBottomL, topToBottomR);
    }
  }

  moveEnemies() {
    this.enemies.forEach((enemy, i) => {

      if(enemy instanceof LinearMovementEnemy){
        if (enemy.path !== undefined && enemy.path.length !== 0) {
          this.moveEnemyLinearly(enemy);
        }
      }

      if (
        enemy.hitbox.xPos > this.shmupWidthPx + 100 ||
        enemy.hitbox.yPos > this.shmupHeightPx + 100 ||
        enemy.hitbox.xPos <  -100 ||
        enemy.hitbox.yPos < -100
      ) {
        this.enemies.splice(i, 1);
      }
    });
  }

  private moveEnemyLinearly(enemy: LinearMovementEnemy) {
    if (enemy.path[0].loc.x === Math.round(enemy.hitbox.xPos) &&
      enemy.path[0].loc.y === Math.round(enemy.hitbox.yPos)) {
      if(enemy.path[0].timeAtDestMs === undefined || enemy.path[0].timeAtDestMs <= 0) {
        enemy.path.shift();
      } else {
        enemy.path[0].timeAtDestMs -= 16;
      }
      return;
    }

    //Find the X and Y distance from the current point, to the destination, then use cos and sin bullshit (expanded using pythagorean) to find speeds
    const enemyPoint = { x: enemy.hitbox.xPos, y: enemy.hitbox.yPos };
    const dest = { x: enemy.path[0].loc.x, y: enemy.path[0].loc.y };

    const result = MovingStuff.moveStartPointTowardDestPoint(
      (enemy.path[0].speed ?  enemy.path[0].speed : enemy.speed),
      enemyPoint,
      dest
    );
    enemy.hitbox.xPos = result.x;
    enemy.hitbox.yPos = result.y;
  }

  checkBulletEnemyCollision() {
    this.enemies.forEach((enemy, i) => {
      this.redGuyBullets.forEach((bullet, j) => {
        let bulletSquare = new Square(bullet.hitbox);
        let enemySquare = new Square(enemy.hitbox);
        if (Square.checkSquareOverlap(bulletSquare, enemySquare)) {
          this.redGuyBullets.splice(j, 1);
          enemy.health -= bullet.damage;
          this.soundServ.damageSound.play();
          if (enemy.health <= 0) {
            this.enemies.splice(i, 1);
            this.soundServ.enemyDeath.play();
          }
        }
      });
    });
  }

  checkBulletPlayerCollision() {
    for (let bullet of this.enemyBullets) {
      let bulletSquare = new Square(bullet.hitbox);
      let redguySquare = new Square(this.redGuyHitBox);
      if (
        this.redGuyState === playerState.normal &&
        Square.checkSquareOverlap(bulletSquare, redguySquare)
      ) {
        this.killPlayer();
        this.soundServ.playerDeath.play();
      }
    }
  }

  urDead = false;
  hideRedGuy = false;

  killPlayer() {
    this.redGuyState = playerState.respawning;
    this.redGuyLives--;
    this.hideRedGuy = true;
    if (this.redGuyLives > 0) {
      setTimeout(() => {
        this.redGuyPos.xPos = REDGUY_START_POS.x;
        this.redGuyPos.yPos = REDGUY_START_POS.y;

        this.redGuyHitBox.xPos = this.redGuyHitboxStartPos.x;
        this.redGuyHitBox.yPos = this.redGuyHitboxStartPos.y;
        this.hideRedGuy = false;
        this.redGuyState = playerState.normal;
      }, 2000);
    } else {
      this.redGuyState = playerState.dead;
      setTimeout(() => {
        this.urDead = true;
      }, 2000);
    }
  }
}
