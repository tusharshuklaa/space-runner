import { $, getStyle } from "./util";
import { headerHeight } from "./constants";

export default class Character {
  player: HTMLElement;
  height: number;
  width: number;
  left: number;
  obstacleWidth: number;
  isJumping: boolean;
  jumpInterval: number;
  screenHeight: number;
  jumpHandler: (e: MouseEvent) => void;
  jumpOnKeypressHandler: (e: KeyboardEvent) => void;

  constructor(selector: string, obstacleWidth: number, screenHeight: number) {
    this.player = $(selector) as HTMLElement;
    this.height = getStyle(this.player, "height");
    this.width = getStyle(this.player, "width");
    this.left = getStyle(this.player, "left");
    this.obstacleWidth = obstacleWidth;
    this.isJumping = false;
    this.jumpInterval = 0;
    this.screenHeight = screenHeight;
    this.jumpHandler = this.jump.bind(this);
    this.jumpOnKeypressHandler = this.jumpOnKeypress.bind(this);

    // Jump character on mouse click or SPACEBAR press
    document.addEventListener("click", this.jumpHandler);
    document.addEventListener("keyup", this.jumpOnKeypressHandler);
  }

  jump(): void {
    this.stopJumping();
    this.isJumping = true;
    let jumpCount = 0;
    const jumpPx = this.screenHeight * 0.005274;
    this.jumpInterval = window.setInterval(() => {
      const characterTop = this.getTop();
      if (characterTop > headerHeight && jumpCount < 15) {
        this.player.style.top = `${characterTop - jumpPx}px`;
      }

      if (jumpCount > 20) {
        this.stopJumping();
        this.isJumping = false;
        jumpCount = 0;
      }
      jumpCount++;
    }, 10);
  }

  stopJumping(): void {
    clearInterval(this.jumpInterval);
  }

  destroyJumping(): void {
    // Prevdnt jumping actions from end-user
    document.removeEventListener("click", this.jumpHandler);
    document.removeEventListener("keyup", this.jumpOnKeypressHandler);
  }

  jumpOnKeypress(e: KeyboardEvent): void {
    if (e.key === " ") {
      this.jump();
    }
  }

  getDimensions(): ICharacterDimensions {
    return {
      height: this.height,
      width: this.width,
      left: this.left,
    };
  }

  isHit(screenHeight: number, obstacle: IObstacleMeasurements): boolean {
    const characterTop = this.getTop();
    const characterZone = this.left + this.width;
    const obstacleCleared = characterZone - this.obstacleWidth;
    // Height of hole is 25% of pipe's height
    const clearPassageHeight = (screenHeight - headerHeight) * 0.25 - this.height;
    // When top of character exceeds the screenHeight - characterHeight, bottom is reached
    const characterHitsBottom = characterTop > screenHeight - this.height;
    // Pipe's left is > character's right and pipe's right is less than character's left.
    const pipe1InCharacterZone = obstacle.pipe1Left < characterZone && obstacle.pipe1Left > obstacleCleared;
    const pipe2InCharacterZone = obstacle.pipe2Left < characterZone && obstacle.pipe2Left > obstacleCleared;
    // Character's top is less than hole's top or more than hole's bottom (complex bcz hole's top is negative)
    const characterHitsHole1 =
      characterTop < obstacle.hole1Top || characterTop > obstacle.hole1Top + clearPassageHeight;
    const characterHitsHole2 =
      characterTop < obstacle.hole2Top || characterTop > obstacle.hole2Top + clearPassageHeight;
    const characterHitsPipe1 = pipe1InCharacterZone && characterHitsHole1;
    const characterHitsPipe2 = pipe2InCharacterZone && characterHitsHole2;

    return characterHitsBottom || characterHitsPipe1 || characterHitsPipe2;
  }

  getTop(): number {
    return getStyle(this.player, "top");
  }

  initiateGravity(screenHeight: number, hitDetection: (g: number) => void): void {
    const gravityPx = screenHeight * 0.00633;
    const gravity: number = window.setInterval(() => {
      const characterTop = this.getTop();

      // Free-fall character if not jumping
      if (!this.isJumping) {
        this.player.style.top = `${characterTop + gravityPx}px`;
      }

      hitDetection(gravity);
    }, 10);
  }
}
