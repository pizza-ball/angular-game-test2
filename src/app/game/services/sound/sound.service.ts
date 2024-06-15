import { Injectable } from '@angular/core';
import { Howl } from 'howler';

@Injectable({
  providedIn: 'root'
})
export class SoundService {

  muted = false;
  currentVolume = 0;
  musicId = 0;
  saveSeek = 0;

  soundsDirectory = '../../../assets/';
  gitSoundsDirectory = 'https://pizza-ball.github.io/angular-game-test2/assets/';

  track1 = new Howl({
    src: [
      this.soundsDirectory + 'INextra.mp3',
    ],
  });
  currentTrack = this.track1;

  shootingSound = new Howl({
    src: [
      this.soundsDirectory + 'shooting.wav',
    ],
  });

  enemyDeath = new Howl({
    src: [this.soundsDirectory + 'enemydieBetter.wav'],
  });

  damageSound = new Howl({
    src: [
      this.soundsDirectory + 'damage00.wav',
    ],
  });

  enemyBulletSound = new Howl({
    src: [
      this.soundsDirectory + 'kira01.wav',
    ],
  });

  playerDeath = new Howl({
    src: [
      this.soundsDirectory + 'pldead00.wav',
    ],
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
      let volDecimal = (this.currentVolume / 100) / 2;
      let medium = volDecimal/2;
      let quiet = volDecimal/4;

      this.currentTrack.volume(volDecimal);
      this.shootingSound.volume(quiet);
      this.enemyDeath.volume(medium);
      this.damageSound.volume(quiet);
      this.enemyBulletSound.volume(medium);
      this.playerDeath.volume(medium);
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

  muteAudioToggle(){
    Howler.mute(!this.muted);
  }
}
