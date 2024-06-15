import {
  AfterViewInit,
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Square } from '../../helpers/square';
import {
  leftCoordHitbox,
  bullet,
  point,
  destination,
  enemyBullet,
  bulletBehavior,
  bulletPattern,
} from '../../helpers/interfaces';
import { FormsModule } from '@angular/forms';
import { InputService } from '../services/input/input.service';
import { SoundService } from '../services/sound/sound.service';
import {
  Enemy,
  LinearMovementEnemy,
  enemySprites,
} from '../../helpers/enemies';
import { MovingStuff } from '../../helpers/moving-stuff';
import { BackgroundService } from '../services/3d/background.service';
import { Scene } from '@babylonjs/core';
import { Player } from '../actors/player';

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
  player: Player;

  volumeSliderChoice = 20;

  playerBullets: bullet[] = [];
  enemies: Enemy[] = [];
  enemyBullets: enemyBullet[] = [];
  enemyDeathSprites: leftCoordHitbox[] = [];

  stageTimeDisplay = -1;
  ticksPerSecond = 60;
  tick = 0;
  tickCountLastSecond = 0;
  frameRate = 0;
  animationState = 'running';

  //spawn times are in seconds, later mapped to ticks for precision
  spawnTimes = [[2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10], [12, 13, 14], [15], [17]];

  @ViewChild('rCanvas', {static: true})
  canvasRef: ElementRef<HTMLCanvasElement> | undefined;
  
  private scene: Scene | undefined;

  constructor(public bgService: BackgroundService, public inputServ: InputService, public soundServ: SoundService) { 
    this.player = new Player(inputServ, soundServ, this.shmupWidthPx, this.shmupHeightPx);
  }

  async ngAfterViewInit() {
    if(this.canvasRef){
      this.scene = this.bgService.CreateScene(this.canvasRef.nativeElement);
    }

    this.setupEnemySpawnTimes();

    await this.waitForSoundsToLoad();
    this.soundServ.playMusic('L1');
    this.inputServ.$paused.subscribe((val) => {
      this.gamePaused = val;
      this.soundServ.toggleMusicPause(val);
    });
    //setInterval(() => this.update(), 16);
    this.update();
    setInterval(() => this.countFrameRate(), 500);
    //this.soundServ.muteAudioToggle();
  }

  setupEnemySpawnTimes() {
    this.spawnTimes = this.spawnTimes.map((array) => {
      return array.map((element) => {
        return Math.round(element * this.ticksPerSecond)
      })
    });
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
    this.frameRate = (this.tick - this.tickCountLastSecond) * 2;
    this.tickCountLastSecond = this.tick;
  }

  update() {

    this.animationState = this.gamePaused ? 'paused' : 'running';
    if (!this.gamePaused) {
      if(this.scene){
        this.bgService.updateBG1(this.scene);
      }
      this.soundServ.setVolume(this.volumeSliderChoice);
      this.tick++;
      this.timers();
      this.spawnEnemiesOnTimer();
      this.player.handleMovement();
      this.handleFiring();
      this.moveBullets();
      this.moveEnemies();
      this.checkBulletEnemyCollision();
      this.player.checkBulletPlayerCollision(this.enemyBullets);
    }

    setTimeout(() => this.update(), 16);
  }

  timers() {
    if (this.stageTimeDisplay === -1) {
      this.stageTimeDisplay = 0;
      setInterval(() => {
        this.stageTimeDisplay++;
      }, 10);
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
    let playerShots = this.player.playerFiring();
    if(playerShots){
      this.soundServ.shootingSound.play();
      playerShots.forEach(shot => {this.playerBullets.push(shot);});
    }

    //Handle enemy firing
    this.enemies.forEach((enemy) => {
      if (enemy.checkToFire(this.tick)) {
        let target: point = { x: 0, y: 0 };

        if (enemy.bulletBehavior === bulletBehavior.atPlayer) {
          target = { x: this.player.hitbox.xPos, y: this.player.hitbox.yPos };
        } else if (enemy.bulletBehavior === bulletBehavior.atPoint) {
          target = { x: enemy.shootWhere.x, y: enemy.shootWhere.y };
        } else if (enemy.bulletBehavior === bulletBehavior.atBottom) {
          target = { x: enemy.hitbox.xPos + Math.round(enemy.hitbox.width / 3), y: 1000 };
        }

        this.spawnEnemyBullet(enemy, target);
      }
    });
  }

  private spawnEnemyBullet(enemy: Enemy, target: point) {
    if (enemy.bulletPattern === bulletPattern.single) {
      let newBullet: enemyBullet = {
        hitbox: {
          xPos: enemy.hitbox.xPos + Math.round(enemy.hitbox.width / 3),
          yPos: enemy.hitbox.yPos + enemy.hitbox.height,
          width: 10,
          height: 10,
        },
        speed: 3,
        damage: 1,
        xyVel: { x: 0, y: 0 },
        destination: target,
        behavior: enemy.bulletBehavior,
        pattern: enemy.bulletPattern
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
    } else if (enemy.bulletPattern === bulletPattern.laser) {
      let newLaser: enemyBullet = {
        hitbox: {
          xPos: enemy.hitbox.xPos + Math.round(enemy.hitbox.width / 3),
          yPos: enemy.hitbox.yPos + enemy.hitbox.height,
          width: 10,
          height: 10,
        },
        speed: 5,
        damage: 1,
        xyVel: { x: 0, y: 0 },
        destination: target,
        behavior: enemy.bulletBehavior,
        pattern: enemy.bulletPattern
      };
      const bulletPoint = {
        x: newLaser.hitbox.xPos,
        y: newLaser.hitbox.yPos,
      };
      const dest = { x: newLaser.destination.x, y: newLaser.destination.y };
      newLaser.xyVel = MovingStuff.getXYVelocityTowardDestWithGivenSpeed(
        newLaser.speed,
        bulletPoint,
        dest
      );
      this.enemyBullets.push(newLaser);
    }
    //this.soundServ.enemyBulletSound.play();
  }

  moveBullets() {
    let shouldPop = false;
    this.playerBullets.forEach((bullet) => {
      bullet.hitbox.yPos -= bullet.speed;
      if (bullet.hitbox.yPos < -30) {
        shouldPop = true;
      }
    });
    if (shouldPop) {
      this.playerBullets.shift();
      this.playerBullets.shift();
    }

    //Handle enemy bullet paths
    this.enemyBullets.forEach((bullet) => {
      if (bullet.pattern === bulletPattern.single) {
        bullet.hitbox.xPos += bullet.xyVel.x;
        bullet.hitbox.yPos += bullet.xyVel.y;
      } else if (bullet.pattern === bulletPattern.laser) {
        bullet.hitbox.height += bullet.xyVel.y;
        if (bullet.hitbox.height > this.shmupHeightPx + 100) {
          bullet.hitbox.yPos += bullet.xyVel.y;
        }
      }

      // if (
      //   bullet.behavior === bulletBehavior.atPoint ||
      //   bullet.behavior === bulletBehavior.atPlayer ||
      //   bullet.behavior === bulletBehavior.atBottom
      // ) {
      //   bullet.hitbox.xPos += bullet.xyVel.x;
      //   bullet.hitbox.yPos += bullet.xyVel.y;
      // }
    });
  }

  // Values multiplied by tickrate are seconds
  spawnEnemiesOnTimer() {
    if (this.spawnTimes[0].includes(this.tick)) {
      const ySpawnPoint = 50 + MovingStuff.getRandomInt(30);
      const rightSide: destination = {
        loc: { x: this.shmupWidthPx + 60, y: 400 },
      };
      let leftToRighter = new LinearMovementEnemy(
        enemySprites.ratBall,
        [rightSide],
        [5],
        this.tick,
        bulletBehavior.atPlayer,
        bulletPattern.single,
      );
      leftToRighter.changeStartingPos(-90, ySpawnPoint);
      const leftSide: destination = { loc: { x: -60, y: 400 } };
      let rightToLefter = new LinearMovementEnemy(
        enemySprites.ratBall,
        [leftSide],
        [5],
        this.tick,
        bulletBehavior.atPlayer,
        bulletPattern.single,
      );
      rightToLefter.changeStartingPos(this.shmupWidthPx + 90, ySpawnPoint);
      rightToLefter.health = 4;
      leftToRighter.health = 4;
      this.enemies.push(rightToLefter);
      this.enemies.push(leftToRighter);
    }

    if (this.spawnTimes[1].includes(this.tick)) {
      const rightSide: destination = { loc: { x: 400, y: 200 } };
      const up: destination = { loc: { x: 400, y: 100 } };
      const leave: destination = { loc: { x: -100, y: 100 } };
      let leftToRighter = new LinearMovementEnemy(
        enemySprites.ratUfo,
        [rightSide, up, leave],
        [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6],
        this.tick,
        bulletBehavior.atPlayer,
        bulletPattern.single,
      );
      leftToRighter.changeStartingPos(-90, 200);
      this.enemies.push(leftToRighter);
    }

    if (this.spawnTimes[2].includes(this.tick)) {
      const fromAboveL: destination = {
        loc: { x: 150, y: 150 },
        speed: 8,
        timeAtDestMs: 5000,
      };
      const leaveL: destination = { loc: { x: 150, y: 1000 }, speed: 4 };
      const fromAboveR: destination = {
        loc: { x: this.shmupWidthPx - 150, y: 150 },
        speed: 8,
        timeAtDestMs: 5000,
      };
      const leaveR: destination = {
        loc: { x: this.shmupWidthPx - 150, y: 1000 },
        speed: 4,
      };
      let topToBottomL = new LinearMovementEnemy(
        enemySprites.ratUfo,
        [fromAboveL, leaveL],
        [1, 1.5, 2, 2.5, 3, 3.5, 4],
        this.tick,
        bulletBehavior.atBottom,
        bulletPattern.single,
        { x: 0, y: 1000 }
      );
      let topToBottomR = new LinearMovementEnemy(
        enemySprites.ratUfo,
        [fromAboveR, leaveR],
        [1, 1.5, 2, 2.5, 3, 3.5, 4],
        this.tick,
        bulletBehavior.atBottom,
        bulletPattern.single,
        { x: 0, y: 1000 }
      );
      topToBottomL.changeStartingPos(150, -90);
      topToBottomR.changeStartingPos(this.shmupWidthPx - 150, -90);
      this.enemies.push(topToBottomL, topToBottomR);
    }

    if (this.spawnTimes[3].includes(this.tick)) {
      const fromAbove: destination = {
        loc: { x: Math.round(this.shmupWidthPx / 2) - 15, y: 200 },
        speed: 8,
        timeAtDestMs: 5000,
      };
      const leave: destination = { loc: { x: Math.round(this.shmupWidthPx / 2) - 15, y: 1000 }, speed: 4, timeAtDestMs: 2000 };
      let topToBottom = new LinearMovementEnemy(
        enemySprites.cheeseCanon,
        [fromAbove, leave],
        [1],
        this.tick,
        bulletBehavior.atBottom,
        bulletPattern.laser,
        { x: 0, y: 1000 }
      );
      topToBottom.changeStartingPos(Math.round(this.shmupWidthPx / 2) - 15, -50);
      this.enemies.push(topToBottom);
    }
  }

  moveEnemies() {
    this.enemies.forEach((enemy, i) => {
      if (enemy instanceof LinearMovementEnemy) {
        if (enemy.path !== undefined && enemy.path.length !== 0) {
          this.moveEnemyLinearly(enemy);
        }
      }

      if (
        enemy.hitbox.xPos > this.shmupWidthPx + 100 ||
        enemy.hitbox.yPos > this.shmupHeightPx + 100 ||
        enemy.hitbox.xPos < -100 ||
        enemy.hitbox.yPos < -100
      ) {
        this.enemies.splice(i, 1);
      }
    });
  }

  private moveEnemyLinearly(enemy: LinearMovementEnemy) {
    if (
      enemy.path[0].loc.x === Math.round(enemy.hitbox.xPos) &&
      enemy.path[0].loc.y === Math.round(enemy.hitbox.yPos)
    ) {
      if (
        enemy.path[0].timeAtDestMs === undefined ||
        enemy.path[0].timeAtDestMs <= 0
      ) {
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
      enemy.path[0].speed ? enemy.path[0].speed : enemy.speed,
      enemyPoint,
      dest
    );
    enemy.hitbox.xPos = result.x;
    enemy.hitbox.yPos = result.y;
  }

  checkBulletEnemyCollision() {
    this.enemies.forEach((enemy, i) => {
      this.playerBullets.forEach((bullet, j) => {
        let bulletSquare = new Square(bullet.hitbox);
        let enemySquare = new Square(enemy.hitbox);
        if (Square.checkSquareOverlap(bulletSquare, enemySquare)) {
          this.playerBullets.splice(j, 1);
          enemy.health -= bullet.damage;
          this.soundServ.damageSound.play();
          if (enemy.health <= 0) {
            this.killEnemy(i);
          }
        }
      });
    });
  }

  killEnemy(i: number) {
    this.enemyDeathSprites.push(this.enemies[i].hitbox);
    this.enemies.splice(i, 1);
    this.soundServ.enemyDeath.play();
  }
}
