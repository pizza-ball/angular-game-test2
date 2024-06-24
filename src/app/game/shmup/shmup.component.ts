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
} from '../../helpers/interfaces';
import { FormsModule } from '@angular/forms';
import { InputService } from '../services/input/input.service';
import { SoundService } from '../services/sound/sound.service';
import { BackgroundService } from '../services/3d/background.service';
import { Scene } from '@babylonjs/core';
import { Player } from '../actors/player';
import { EnemySpawn, spawnMapLevel1 } from '../levels/level1';
import { DEBUG_MODE, PLAYFIELD_HEIGHT, PLAYFIELD_WIDTH, TICKS_PER_SECOND } from '../globals';
import { Dongler } from '../actors/enemies/dongler';
import { EnemyList } from '../actors/enemies/enemylist';
import { Shwoop } from '../actors/enemies/shwoop';

@Component({
  selector: 'app-shmup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shmup.component.html',
  styleUrl: './shmup.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})

export class ShmupComponent implements AfterViewInit {
  widthFromGlobal = PLAYFIELD_WIDTH;
  heightFromGlobal = PLAYFIELD_HEIGHT;
  gamePaused = false;
  player: Player;

  volumeSliderChoice = 20;

  playerBullets: bullet[] = [];
  enemies: any[] = [];
  enemyBullets: any[] = [];
  enemyDeathSprites: leftCoordHitbox[] = [];

  stageTimeDisplay = -1;
  tick = 0;
  tickCountLastSecond = 0;
  frameRate = 0;
  animationState = 'running';

  generatedSpawnTimes: number[] = [];

  @ViewChild('rCanvas', { static: true })
  canvasRef: ElementRef<HTMLCanvasElement> | undefined;

  @ViewChild('2DCanvas', { static: true })
  canvasRef2d: ElementRef<HTMLCanvasElement> | undefined;

  private scene: Scene | undefined;

  constructor(public bgService: BackgroundService, public inputServ: InputService, public soundServ: SoundService) {
    this.player = new Player(inputServ, soundServ, PLAYFIELD_WIDTH, PLAYFIELD_HEIGHT);
  }

  async ngAfterViewInit() {
    if (this.canvasRef) {
      this.scene = this.bgService.CreateScene(this.canvasRef.nativeElement);
    }

    if (this.canvasRef2d) {
      //need to set width and height here because ???????????????????? it just works.
      this.canvasRef2d.nativeElement.width = PLAYFIELD_WIDTH;
      this.canvasRef2d.nativeElement.height = PLAYFIELD_HEIGHT;
    }

    this.collectSpawnTimesAndConvertToTicks();
    // this.setupEnemySpawnTimes();

    await this.waitForSoundsToLoad();
    this.soundServ.playMusic('L1');
    this.inputServ.$paused.subscribe((val) => {
      this.gamePaused = val;
      this.soundServ.toggleMusicPause(val);
    });
    //setInterval(() => this.update(), 16);
    this.update();
    setInterval(() => this.countFrameRate(), 250);
    this.soundServ.muteAudioToggle();
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
    this.frameRate = (this.tick - this.tickCountLastSecond) * 4;
    this.tickCountLastSecond = this.tick;
  }

  printMousePos(event: any) {
    var rect = event.target.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    console.log("Click Coords x : " + x + " ; y : " + y + ".");
  }

  update() {

    this.animationState = this.gamePaused ? 'paused' : 'running';
    if (!this.gamePaused) {
      if (this.scene) {
        this.bgService.updateBG1(this.scene);
      }
      this.soundServ.setVolume(this.volumeSliderChoice);
      this.tick++;
      this.timers();
      this.checkForEnemySpawn(this.tick);
      this.player.handleMovement();
      this.moveAllEnemies();
      this.handlePlayerShooting();
      this.handleEnemyShooting(this.tick, this.player.hitbox.pos);
      this.movePlayerBullets();
      this.moveEnemyBullets();
      this.checkBulletEnemyCollision();
      this.player.checkBulletPlayerCollision(this.enemyBullets);

      if(DEBUG_MODE){
        this.debugDrawActorPaths();
      }
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

  handlePlayerShooting(){
    let playerShots = this.player.playerFiring();
    if (playerShots) {
      this.soundServ.shootingSound.play();
      playerShots.forEach(shot => { this.playerBullets.push(shot); });
    }
  }

  handleEnemyShooting(tick: number, playerPos: point){
    this.enemies.forEach((enemy) => {
      let fired = enemy.shoot(tick, playerPos);
      if (fired) {
        if(Array.isArray(fired)){
          this.enemyBullets.push(...fired);
        } else {
          this.enemyBullets.push(fired);
        }
      }
    });
  }

  movePlayerBullets() {
    let shouldPop = false;
    this.playerBullets.forEach((bullet) => {
      bullet.hitbox.pos.y -= bullet.speed;
      if (bullet.hitbox.pos.y < -30) {
        shouldPop = true;
      }
    });
    if (shouldPop) {
      this.playerBullets.shift();
      this.playerBullets.shift();
    }
  }

  moveEnemyBullets() {
    //Handle enemy bullet paths
    this.enemyBullets.forEach((bullet) => {
      bullet.move();
    });
  }

  collectSpawnTimesAndConvertToTicks() {
    spawnMapLevel1.forEach(enemy => {
      enemy.times.forEach(time => {
        if (!this.generatedSpawnTimes.includes(time)) {
          this.generatedSpawnTimes.push(time);
        }
      });
    });
    this.generatedSpawnTimes.sort((a, b) => a - b);
    this.generatedSpawnTimes = this.generatedSpawnTimes.map(time => Math.round(time * TICKS_PER_SECOND));

    spawnMapLevel1.forEach(enemy => {
      enemy.times = enemy.times.map(time => Math.round(time * TICKS_PER_SECOND));
    });
  }

  checkForEnemySpawn(currentTick: number) {
    if ((this.generatedSpawnTimes.length === 0) || !(this.generatedSpawnTimes[0] === currentTick)) {
      return;
    }

    spawnMapLevel1.forEach((enemy: EnemySpawn) => {
      if (enemy.times.includes(currentTick)) {
        this.spawnEnemy(enemy, currentTick);
      }
    });
    this.generatedSpawnTimes.shift();
  }

  spawnEnemy(enemy: EnemySpawn, currentTick: number) {
    switch (enemy.name) {
      case EnemyList.Dongler:
        this.enemies.push(new Dongler(currentTick, Object.create(enemy.start), Object.create(enemy.path)));
        break;
      case EnemyList.Shwoop:
        this.enemies.push(new Shwoop(currentTick, Object.create(enemy.start), Object.create(enemy.path)));
        break;
      default:
        console.log("unrecognized enemy.");
    }
  }

  moveAllEnemies() {
    for (let i = 0; i < this.enemies.length; i++) {
      this.enemies[i].move();

      //deletes enemies that have finished their path
      if (this.enemies[i].flagForDeletion) {
        this.enemies[i].cleanUp(this.canvasRef2d?.nativeElement.getContext("2d"));
        this.enemies.splice(i, 1);
        i--;
      }
    }

  }

  checkBulletEnemyCollision() {
    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i];

      for (let j = 0; j < this.playerBullets.length; j++) {
        const bullet = this.playerBullets[j];

        let bulletSquare = new Square(bullet.hitbox);
        let enemySquare = new Square(enemy.hitbox);

        if (Square.checkSquareOverlap(bulletSquare, enemySquare)) {
          this.playerBullets.splice(j, 1);
          j--;

          enemy.health -= bullet.damage;
          this.soundServ.damageSound.play();

          if (enemy.health <= 0) {
            this.killEnemy(i);
            this.enemies.splice(i, 1);
            i--;
            break; //Enemy is dead, if we do not break we will check if all remaining player bullets will hit a dead enemy.
          }
        }
      }
    }
  }

  killEnemy(i: number) {
    this.enemyDeathSprites.push(this.enemies[i].hitbox);
    this.enemies[i].cleanUp(this.canvasRef2d?.nativeElement.getContext("2d"));
    this.soundServ.enemyDeath.play();
  }

  debugDrawActorPaths() {
    if (this.canvasRef2d) {
      let ctx = this.canvasRef2d.nativeElement.getContext("2d");
      this.enemies.forEach(enemy => {
        enemy.debugDrawPath(ctx);
      });
    }
  }
}
