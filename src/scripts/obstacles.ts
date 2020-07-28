import { $, getStyle, getTranslateX } from "./util";
import { pipeColorPalette, headerHeight } from "./constants";

export default class Obstacles {
  obstacles: NodeListOf<HTMLElement>;
  holes: NodeListOf<HTMLElement>;
  width: number;
  _score!: number;
  currentScore: HTMLElement;

  constructor(selector: string) {
    this.obstacles = $(selector) as NodeListOf<HTMLElement>;
    this.holes = $(".hole") as NodeListOf<HTMLElement>;
    this.width = getStyle(this.obstacles[0], "width");
    this.currentScore = $("#cScore") as HTMLElement;
  }

  get score(): number {
    return typeof this._score === "undefined" ? 0 : this._score;
  }

  set score(s: number) {
    this._score = s;
  }

  createHoles(): void {
    this.obstacles.forEach((o) => {
      this.randomHoleFn(o);

      o.addEventListener("animationiteration", () => {
        this.randomHoleFn(o);
        this.updateScore();
      });
    });
  }

  randomHoleFn(o: HTMLElement): void {
    // It should return -35 to -95
    const random = -(Math.random() * 60 + 35);
    const hole = o.querySelector(".hole")! as HTMLElement;
    const topPos = `${100 + random}%`;
    const bottomPos = `${125 + random}%`;
    const pipe = o.querySelector(".pipe")! as HTMLElement;
    const pipeColor = pipeColorPalette[Math.floor(Math.random() * pipeColorPalette.length)];
    const backgroundVal = `linear-gradient(
      ${pipeColor} ${topPos},
      transparent ${topPos},
      transparent ${bottomPos},
      ${pipeColor} ${bottomPos}
    )`;
    hole.style.top = `${random}%`;
    pipe.style.backgroundImage = backgroundVal;
  }

  updateScore(): void {
    this.score += 10;
    this.currentScore.innerText = this.score.toString();
  }

  resetPosition(): void {
    let initialPosition = 50;
    this.obstacles.forEach((o) => {
      initialPosition = initialPosition + 25;
      o.style.transform = `translateX(${initialPosition}vw)`;
    });
  }

  pause(): void {
    this.currentScore.innerText = "0";
    this.obstacles.forEach((o) => {
      const pipeLeft = getTranslateX(o) + 3;
      o.classList.remove("moving");
      o.style.transform = `translateX(${pipeLeft}px)`;
    });
  }

  move(): void {
    this.obstacles.forEach((o) => {
      o.classList.add("moving");
    });
  }

  getLeftOf(index: number): number {
    return getTranslateX(this.obstacles[index]);
  }

  getHoleTop(index: number, screenHeight: number): number {
    return screenHeight + headerHeight + getStyle(this.holes[index], "top");
  }
}
