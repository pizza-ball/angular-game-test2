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
  leftCoordHitboxId,
  linePath,
  curvePath,
} from '../../helpers/interfaces';
import { FormsModule } from '@angular/forms';
import { InputService } from '../services/input/input.service';
import { SoundService } from '../services/sound/sound.service';
import { BackgroundService } from '../services/3d/background.service';
import { Scene } from '@babylonjs/core';
import { Player, playerState } from '../actors/player';
import { EnemySpawn, spawnMapLevel1 } from '../levels/level1';
import { DEBUG_MODE, FPS_TARGET, Units } from '../globals';
import { Dongler } from '../actors/enemies/dongler';
import { ActorList } from '../actors/actorlist';
import { Shwoop } from '../actors/enemies/shwoop';
import { PowerPoint } from '../actors/items/power';
import { DrawingStuff } from '../../helpers/drawing-stuff';
import { MovingStuff } from '../../helpers/moving-stuff';
import { BigBoi } from '../actors/enemies/bigboi';
import { Point } from '../actors/items/point';
import { Boss1 } from '../actors/enemies/bosses/boss1';
import { SimpleBullet } from '../actors/bullets/simple-bullet';
import { Enemy } from '../actors/enemies/enemy-abstract';

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
  shmupStyle = {
    width: Units.getPlayfieldWidth(),
    height: Units.getPlayfieldHeight(),
    marginLeft: Units.getUnits(20),
    marginTop: Units.getUnits(15)
  };
  sideBarStyle = {
    width: Units.getUnits(200),
    height: Units.getUnits(350),
    marginLeft: Units.getUnits(575),
    marginTop: Units.getUnits(15),
    volumeBarWidth: Units.getUnits(200),
    volumeBarHeight: Units.getUnits(25)
  };

  player: Player;

  volumeSliderChoice = 20;

  playerBullets: bullet[] = [];
  enemies: Enemy[] = [];
  enemyBullets: SimpleBullet[] = [];
  enemyDeathSprites: leftCoordHitboxId[] = [];
  items: (Point | PowerPoint)[] = [];

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
    this.player = new Player(inputServ, soundServ, Units.getPlayfieldWidth(), Units.getPlayfieldHeight());
  }

  async ngAfterViewInit() {
    if (this.canvasRef) {
      this.scene = this.bgService.CreateScene(this.canvasRef.nativeElement);
    }

    if (this.canvasRef2d) {
      //need to set width and height here because ???????????????????? it just works.
      this.canvasRef2d.nativeElement.width = Units.getPlayfieldWidth();
      this.canvasRef2d.nativeElement.height = Units.getPlayfieldHeight();
    }

    this.collectSpawnTimesAndConvertToTicks();

    await this.waitForSoundsToLoad();
    this.soundServ.playMusic('L1');
    this.inputServ.$paused.subscribe((val) => {
      this.gamePaused = val;
      this.soundServ.toggleMusicPause(val);
    });

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

  updates: string[] = [];
  update() {
    this.inputServ.gamepadHandler();

    this.animationState = this.gamePaused ? 'paused' : 'running';
    if (!this.gamePaused) {
      if (this.scene) {
        this.bgService.updateBG1(this.scene);
      }
      this.soundServ.setVolume(this.volumeSliderChoice);
      this.tick++;
      this.timers();
      
      this.updateEnemies(this.tick, this.player.center);

      //this.assessBoss(this.tick);

      this.checkForEnemySpawn(this.tick);
      this.player.handleMovement();
      this.moveItems();
      this.handlePlayerShooting();
      this.movePlayerBullets();
      this.moveEnemyBullets();
      this.player.checkBulletPlayerCollision(this.enemyBullets, this.enemyDeathSprites);
      this.checkItemPlayerCollision();

      let ctx = this.canvasRef2d?.nativeElement.getContext("2d");
      if (ctx) {
        this.drawEnemyElements(ctx);
          //this.player.debugDrawItemMagnet(ctx);
        this.player.debugDrawItemMagnet(ctx);
        DrawingStuff.clearCanvasAndRedraw(ctx);
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

  //MAJOR TODO: BOSSES HAVE NOT BEEN REFACTORED TO USE THIS METHOD. BOSSES ARE B R O K E N
  updateEnemies(tick: number, playerPos: point){
    for(let i = 0; i < this.enemies.length; i++){
      let enemy = this.enemies[i];
      //check collisions.
      this.checkBulletEnemyCollision(enemy);

      enemy.setTickData(tick, playerPos);

      //assess enemy health, phase duration, all that. Kill enemies that are flagged to be killed.
      enemy.assess();

      if(enemy.ENEMY_TYPE === ActorList.BossGeneric){
        //TODO: Conditionals must be re-written because bosses are not mapped to Enemy currently.
        // if(enemy.defe){
        //   this.convertEnemyBulletsToPoints();
        // } else if (enemy.totalDefeatFlag){
        //   this.killBoss(enemy);
        //   this.enemies.splice(i, 1);
        //   i--;
        //   break; //Enemy is dead, if we do not break we will check if all remaining player bullets will hit a dead enemy.
        // }
      } else {
        if (enemy.defeatFlag) {
          this.killEnemy(enemy);
          this.enemies.splice(i, 1);
          i--;
          continue;//Enemy is dead, if we do not continue we will check if all remaining player bullets will hit a dead enemy.
        } else if(enemy.clearFlag){
          this.enemies.splice(i, 1);
          i--;
          continue;//Enemy is dead, if we do not continue we will check if all remaining player bullets will hit a dead enemy.
        }
      }

      //move enemy
      enemy.move();

      //make enemy shoot
      let fired = enemy.attack();
      if (fired) {
        if (Array.isArray(fired)) {
          this.enemyBullets.push(...fired);
        } else {
          this.enemyBullets.push(fired);
        }
      }
    }
  }

  checkBulletEnemyCollision(enemy: any) {
    for (let j = 0; j < this.playerBullets.length; j++) {
      const bullet = this.playerBullets[j];

      if (Square.checkHitboxOverlap(bullet.hitbox, enemy.hitbox)) {
        const hit = enemy.hitByBullet(bullet);
        if(!hit){
          //The enemy reports not being affected by this bullet despite the collision, likely due to no remaining health. Skip checking any other player bullets for this enemy.
          break;
        }

        this.playerBullets.splice(j, 1);
        j--;

        if(enemy.ENEMY_TYPE === ActorList.BossGeneric){
          //should check if boss phase is below 10% health. If so, play different damage sound.
          this.soundServ.damageSound.play();
        } else {
          this.soundServ.damageSound.play();
        }
      }
    }
  }

  killEnemy(enemy: Enemy) {
    
    let dataForDeathSprite = {
      id: enemy.ENEMY_TYPE,
      pos: { x: enemy.hitbox.pos.x, y: enemy.hitbox.pos.y },
      width: enemy.hitbox.width,
      height: enemy.hitbox.height,
    };

    this.enemyDeathSprites.push(dataForDeathSprite);
    this.soundServ.enemyDeath.play();
    this.dropItems(enemy);

    enemy.cleanUp();
  }

  killBoss(enemy: Dongler | Shwoop | BigBoi | Boss1) {

    let dataForDeathSprite = {
      id: enemy.ENEMY_TYPE,
      pos: { x: enemy.hitbox.pos.x, y: enemy.hitbox.pos.y },
      width: enemy.hitbox.width,
      height: enemy.hitbox.height,
    };

    this.enemyDeathSprites.push(dataForDeathSprite);
    this.soundServ.bossKill.play();
    this.dropItems(enemy);
    this.convertEnemyBulletsToPoints();

    enemy.cleanUp();
  }

  handlePlayerShooting() {
    let playerShots = this.player.playerFiring();
    if (playerShots) {
      this.soundServ.shootingSound.play();
      playerShots.forEach(shot => { this.playerBullets.push(shot); });
    }
  }

  movePlayerBullets() {
    for (let i = 0; i < this.playerBullets.length; i++) {
      this.playerBullets[i].hitbox.pos.y -= this.playerBullets[i].speed;
      if (this.playerBullets[i].hitbox.pos.y < Units.getUnits(-30)) {
        this.playerBullets.splice(i, 1);
        i--;
      }
    };
  }

  moveEnemyBullets() {
    for (let i = 0; i < this.enemyBullets.length; i++) {
      this.enemyBullets[i].move();

      if (this.enemyBullets[i].flagForDeletion) {
        //this.enemyBullets[i].cleanUp(this.canvasRef2d?.nativeElement.getContext("2d"));
        this.enemyBullets.splice(i, 1);
        i--;
      }
    }
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
    this.generatedSpawnTimes = this.generatedSpawnTimes.map(time => Math.round(time * FPS_TARGET));

    spawnMapLevel1.forEach(enemy => {
      enemy.times = enemy.times.map(time => Math.round(time * FPS_TARGET));
    });
  }

  checkForEnemySpawn(currentTick: number) {
    if ((this.generatedSpawnTimes.length === 0) || 
        !(this.generatedSpawnTimes[0] === currentTick)) {
      return;
    }

    if(this.enemies?.[0]?.ENEMY_TYPE !== ActorList.BossGeneric){ //Prevents enemy spawns when a boss is active.
      spawnMapLevel1.forEach((enemy: EnemySpawn) => {
        if (enemy.times.includes(currentTick)) {
          this.spawnEnemy(enemy, currentTick);
        }
      });
    }
    this.generatedSpawnTimes.shift();
  }

  spawnEnemy(spawn: EnemySpawn, currentTick: number) {
    switch (spawn.name) {
      case ActorList.Dongler:
        this.enemies.push(new Dongler(
          this.soundServ, currentTick, spawn.start.x, spawn.start.y, this.clonePath(spawn.path),
          Units.getUnits(30), Units.getUnits(30), 2, 3));
        break;
      case ActorList.Shwoop:
        this.enemies.push(new Shwoop(
          this.soundServ, currentTick, spawn.start.x, spawn.start.y, this.clonePath(spawn.path),
          Units.getUnits(30), Units.getUnits(30), 2, 3));
        break;
      case ActorList.BigBoi:
        this.enemies.push(new BigBoi(
          this.soundServ, currentTick, spawn.start.x, spawn.start.y, this.clonePath(spawn.path),
          Units.getUnits(76), Units.getUnits(76), 5, 10));
        break;
      case ActorList.Boss1:
        //this.enemies.push(new Boss1(this.soundServ, currentTick));
        break;
      default:
        console.log("unrecognized enemy.");
    }
  }

  //Deep copy of path must be created, otherwise actors of the same spawn time will share and alter path data.
  clonePath(path: (linePath|curvePath)[]){
    let pathString = JSON.stringify(path);
    return JSON.parse(pathString);
  }

  moveItems() {
    for (let i = 0; i < this.items.length; i++) {
      this.items[i].move(this.player.center.x, this.player.center.y);

      //deletes enemies that have finished their path
      if (this.items[i].flagForDeletion) {
        //this.items[i].cleanUp(this.canvasRef2d?.nativeElement.getContext("2d"));
        this.items.splice(i, 1);
        i--;
      }
    }
  }

  convertEnemyBulletsToPoints(){
    for(let i = 0; i < this.enemyBullets.length; i++){
      const enemy = this.enemyBullets[i];
      this.items.push(new Point(enemy.hitbox.pos.x, enemy.hitbox.pos.y));
    }
    this.enemyBullets = [];
  }

  dropItems(enemy: Enemy | Boss1) {
    for (let i = 0; i < enemy.powerCount; i++) {
      const xPosRando = enemy.center.x + MovingStuff.getRandomInt(enemy.hitbox.width);
      const yPosRando = enemy.center.y + MovingStuff.getRandomInt(enemy.hitbox.height);
      this.items.push(new PowerPoint(xPosRando, yPosRando));
    }

    for (let i = 0; i < enemy.pointCount; i++) {
      const xPosRando = enemy.center.x + MovingStuff.getRandomInt(enemy.hitbox.width);
      const yPosRando = enemy.center.y + MovingStuff.getRandomInt(enemy.hitbox.height);
      this.items.push(new Point(xPosRando, yPosRando));
    }
  }

  drawEnemyElements(ctx: CanvasRenderingContext2D) {
    this.enemies.forEach(enemy => {
      enemy.drawThings(ctx);
    });
  }

  checkItemPlayerCollision() {
    for (let i = 0; i < this.items.length; i++) {
      let item = this.items[i];

      if(this.player.state === playerState.dead){
        item.flagForCollection = false;
        continue;
      }

      let itemSquare = new Square(item.hitbox);
      if (!item.flagForCollection &&
        Square.checkSquareCircleOverlap(itemSquare, this.player.center, this.player.itemMagnetismRadius)
      ) {
        item.flagForCollection = true;
        continue; //item is now in range to scoop. obviously it's not colliding with the player. Move to next item early.
      }

      let playerSquare = new Square(this.player.hitbox);
      if ( Square.checkSquareOverlap(itemSquare, playerSquare) ) {
        //destroy the item, add the item's value to the player
        if(item.ITEM_TYPE === "point"){
          this.soundServ.itemPickup.play();
          this.player.score += item.value;
        }
        if(item.ITEM_TYPE === "power"){
          this.soundServ.itemPickup.play();
          this.player.adjustPowerLevel(item.value);
        }
        this.items.splice(i, 1);
        i--;
      }
    }
  }
}
