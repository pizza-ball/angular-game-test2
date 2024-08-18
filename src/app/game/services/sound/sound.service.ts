import { Injectable } from '@angular/core';
import { Howl } from 'howler';

@Injectable({
  providedIn: 'root'
})
export class SoundService {

  muted = false;
  currentVolume = 0;
  mediumVol = 0;
  quietVol = 0;
  musicId = 0;
  saveSeek = 0;

  soundsDirectory = '../../../assets/';
  specificSoundsDirectory = '../../../assets/se/';
  gitSoundsDirectory = 'https://pizza-ball.github.io/angular-game-test2/assets/';

  track1 = new Howl({
    src: [
      this.soundsDirectory + 'music/lolkstage1.mp3',
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
      this.specificSoundsDirectory + 'se_tan00.wav',
    ],
  });

  playerDeath = new Howl({
    src: [
      this.soundsDirectory + 'pldead00.wav',
    ],
  });

  itemPickup = new Howl({
    src: [
      this.specificSoundsDirectory + 'se_item00.wav',
    ],
  });

  powerUp = new Howl({
    src: [
      this.specificSoundsDirectory + 'se_powerup.wav',
    ],
  });

  bigKill = new Howl({
    src: [
      this.specificSoundsDirectory + 'se_enep02.wav',
    ],
  });

  bossKill = new Howl({
    src: [
      this.specificSoundsDirectory + 'se_enep01.wav',
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
      this.playerDeath.state() === 'loaded' &&
      this.itemPickup.state() === 'loaded'
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
      this.mediumVol = volDecimal/2;
      this.quietVol = volDecimal/4;

      this.currentTrack.volume(volDecimal);
      this.shootingSound.volume(this.quietVol);
      this.enemyDeath.volume(this.mediumVol);
      this.damageSound.volume(this.quietVol);
      this.enemyBulletSound.volume(this.quietVol);
      this.playerDeath.volume(this.mediumVol);
      this.itemPickup.volume(this.quietVol);
      this.powerUp.volume(this.mediumVol);
      this.bigKill.volume(this.mediumVol);
      this.bossKill.volume(this.mediumVol);
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
