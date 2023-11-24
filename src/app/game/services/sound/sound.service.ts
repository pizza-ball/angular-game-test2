import { Injectable } from '@angular/core';
import { Howl } from 'howler';

@Injectable({
  providedIn: 'root'
})
export class SoundService {

  currentVolume = 0;
  musicId = 0;
  saveSeek = 0;

  soundsDirectory = '../../../assets/';
  gitSoundsDirectory = 'https://pizza-ball.github.io/angular-game-test2/assets/';

  track1 = new Howl({
    src: [
      this.soundsDirectory + 'secrethoppin.mp3',
    ],
    volume: 0.5,
  });
  currentTrack = this.track1;

  shootingSound = new Howl({
    src: [
      this.soundsDirectory + 'shooting.wav',
    ],
    volume: 0.5,
  });

  enemyDeath = new Howl({
    src: [this.soundsDirectory + 'enemydieBetter.wav'],
    volume: 0.5,
  });

  damageSound = new Howl({
    src: [
      this.soundsDirectory + 'damage00.wav',
    ],
    volume: 0.5,
  });

  enemyBulletSound = new Howl({
    src: [
      this.soundsDirectory + 'kira01.wav',
    ],
    volume: 0.5,
  });

  playerDeath = new Howl({
    src: [
      this.soundsDirectory + 'pldead00.wav',
    ],
    volume: 0.5,
  });

  constructor() { 
  }

  isLevel1SoundLoaded(){
    if (
      this.currentTrack.state() === 'loaded' &&
      this.shootingSound.state() === 'loaded' &&
      this.enemyDeath.state() === 'loaded' &&
      this.damageSound.state() === 'loaded' &&
      this.enemyBulletSound.state() === 'loaded' &&
      this.playerDeath.state() === 'loaded'
    ){
      return true;
    }
    return false;
  }

  playMusic(track: string){
    switch(track){
      case 'L1':
        this.currentTrack = this.track1;
        this.musicId = this.currentTrack.play()
    }
  }

  setVolume(value: number){
    if(this.currentVolume !== value){
      this.currentVolume = value;
      let reducedVol = this.currentVolume / 100

      this.currentTrack.volume(reducedVol * 0.5);
      this.shootingSound.volume(reducedVol * 0.5);
      this.shootingSound.volume(reducedVol * 0.5);
      this.enemyDeath.volume(reducedVol * 0.5);
      this.damageSound.volume(reducedVol * 0.5);
      this.enemyBulletSound.volume(reducedVol * 0.9);
      this.playerDeath.volume(reducedVol * 0.9);
    }
  }

  toggleMusicPause(paused: boolean) {
    if (paused) {
      this.currentTrack.pause();
      this.saveSeek = this.currentTrack.seek(this.musicId);
    } else {
      this.currentTrack.play(this.musicId);
      this.currentTrack.seek(this.saveSeek, this.musicId);
    }
  }
}
