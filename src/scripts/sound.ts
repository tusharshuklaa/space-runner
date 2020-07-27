export default class Sound {
  sound: HTMLAudioElement;

  constructor(src: string) {
    const soundEl = document.createElement("audio");
    soundEl.src = src;
    soundEl.setAttribute("preload", "auto");
    soundEl.setAttribute("controls", "none");
    soundEl.style.display = "none";
    this.sound = soundEl;
    document.body.appendChild(this.sound);
  }

  play(): void {
    void this.sound.play();
  }

  stop(): void {
    this.sound.pause();
  }

  loopOn(): void {
    this.sound.loop = true;
  }

  loopOff(): void {
    this.sound.loop = false;
  }
}
