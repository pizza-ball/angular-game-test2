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
  wayCoolerEnemy,
  destination,
} from '../../helpers/interfaces';
import { FormsModule } from '@angular/forms';
import { InputService } from '../services/input/input.service';
import { SoundService } from '../services/sound/sound.service';
import { linearMovementEnemy } from '../../helpers/enemies';
const REDGUY_HITBOX_SIZE = 10;

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
  volumeSliderChoice = 20;

  allowedToFire = true;
  vel = 7;

  redGuyBullets: bullet[] = [];
  // enemies: enemy[] = [];
  enemies: wayCoolerEnemy[] = [];

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
    this.animationState = this.inputServ.keysDown.pause ? 'paused' : 'running';
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
    if (this.inputServ.keysDown.shoot && this.allowedToFire) {
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
    if (this.tick === 180 || this.tick === 240 || this.tick === 300) {
      const rightSide: destination = {loc: {x: 400, y:200}}
      const up: destination = {loc: {x: 400, y:100}}
      const leave: destination = {loc: {x: -100, y:100}}
      let leftToRighter = new linearMovementEnemy([rightSide, up, leave]);
      leftToRighter.changeStartingPos(-100, 200);
      this.enemies.push(leftToRighter);
    }
  }

  moveEnemies() {
    this.enemies.forEach((enemy, i) => {
      if (enemy.path !== undefined && enemy.path.length !== 0) {
        //Find the X and Y distance from the current point, to the destination, then use cos and sin bullshit (expanded using pythagorean) to find speeds
        const xDist = enemy.path[0].loc.x - enemy.hitbox.xPos;
        const yDist = enemy.path[0].loc.y - enemy.hitbox.yPos;

        const bottom = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));

        const xRelativeSpeed = (enemy.speed / bottom) * xDist;
        const yRelativeSpeed = (enemy.speed / bottom) * yDist;

        enemy.hitbox.xPos += xRelativeSpeed;
        enemy.hitbox.yPos += yRelativeSpeed;

        if (enemy.path[0].loc.x === Math.round(enemy.hitbox.xPos) && enemy.path[0].loc.y === Math.round(enemy.hitbox.yPos)) {
          console.log('out of path!');
          enemy.path.shift();
        }
      }

      if (
        enemy.hitbox.xPos > this.shmupWidthPx + 100 ||
        enemy.hitbox.yPos > this.shmupHeightPx + 100
      ) {
        this.enemies.splice(i, 1);
      }
    });
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
}
