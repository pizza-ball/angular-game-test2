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
import { leftCoordHitbox, bullet, enemy, point } from '../../helpers/interfaces';
import { Howl } from 'howler';
import { FormsModule } from '@angular/forms';
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

  keysPressed = {
    up: false,
    down: false,
    right: false,
    left: false,
    shoot: false,
    paused: false
  };

  redGuyBullets: bullet[] = [];
  enemies: enemy[] = [];

  stageTimeDisplay = -1;
  tick = 0;
  tickCountLastSecond = 0;
  frameRate = 0;
  animationState = "running";

  // music = new Howl({
  //   src: ['../../../assets/secrethoppin.mp3', 'https://pizza-ball.github.io/angular-game-test2/assets/secrethoppin.mp3'],
  //   volume: .5,
  // });

  // shootingSound = new Howl({
  //   src: ['../../../assets/shooting.wav', 'https://pizza-ball.github.io/angular-game-test2/assets/shooting.wav'],
  //   volume: .5,
  // });

  // enemyDeath = new Howl({
  //   src: ['../../../assets/kira01.wav', 'https://pizza-ball.github.io/angular-game-test2/assets/kira01.wav'],
  //   volume: .5,
  // });

  // damageSound = new Howl({
  //   src: ['../../../assets/damage00.wav', 'https://pizza-ball.github.io/angular-game-test2/assets/damage00.wav'],
  //   volume: .5,
  // });

  music = new Howl({
    src: ['https://pizza-ball.github.io/angular-game-test2/assets/secrethoppin.mp3'],
    volume: .5,
  });

  shootingSound = new Howl({
    src: ['https://pizza-ball.github.io/angular-game-test2/assets/shooting.wav'],
    volume: .5,
  });

  enemyDeath = new Howl({
    src: ['https://pizza-ball.github.io/angular-game-test2/assets/kira01.wav'],
    volume: .5,
  });

  damageSound = new Howl({
    src: ['https://pizza-ball.github.io/angular-game-test2/assets/damage00.wav'],
    volume: .5,
  });

  musicId = 0;
  saveSeek = 0;

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    this.keyDownHandler(event.key);
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    this.keyUpHandler(event.key);
  }

  async ngAfterViewInit() {
    await this.waitForSoundsToLoad();
    this.musicId = this.music.play();
    setInterval(() => this.update(), 16);
    setInterval(() => this.countFrameRate(), 1000);
  }

  async waitForSoundsToLoad(){
    return await new Promise(resolve => {
      const interval = setInterval(() => {
        if (this.music.state() === 'loaded' &&
        this.shootingSound.state() === 'loaded' &&
        this.enemyDeath.state() === 'loaded' &&
        this.damageSound.state() === 'loaded') {
          console.log("Music Loading complete");
          resolve('foo');
          clearInterval(interval);
        };
      }, 1000);
    });
  }

  countFrameRate(){
    this.frameRate = this.tick - this.tickCountLastSecond;
    this.tickCountLastSecond = this.tick;
  }

  update() {
    if(!this.keysPressed.paused) {
      this.music.volume(this.currentSfxVolume() * 0.5);
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

  toggleMusicPause(paused: boolean) {
    if (!paused) {
        this.music.play(this.musicId);
        this.music.seek(this.saveSeek, this.musicId);
    } else {
      this.music.pause();
      this.saveSeek = this.music.seek(this.musicId);
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
    if (key === 'p') {
      this.keysPressed.paused = !this.keysPressed.paused;
      this.animationState = this.keysPressed.paused ? "paused" : "running";
      this.toggleMusicPause(this.keysPressed.paused)
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
      this.shootingSound.volume(this.currentSfxVolume() * 0.5);
      this.shootingSound.play();
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
      this.createNewEnemy();
    }
  }

  private createNewEnemy() {
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
          this.damageSound.volume(this.currentSfxVolume() * 0.5); 
          this.damageSound.play();
          if(enemy.health <= 0){
            this.enemies.splice(i, 1);
            this.enemyDeath.volume(this.currentSfxVolume() * 0.5); 
            this.enemyDeath.play();
          }
        }
      });
    });
  }

  currentSfxVolume(){
    return this.volumeSliderChoice/100;
  }
}
