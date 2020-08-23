import Sound from "./sound";
import { $ } from "./util";
import { __MUSIC_PREF_KEY__ } from "./constants";
import Obstacles from "./obstacles";
import Character from "./character";
import Score from "./Score";
import AddStars from "./StarryBg";

const playBtn = $("#startGameBtn") as HTMLElement;
const overlay = $("#overlay") as HTMLElement;
const musicBtn = $("#toggleMusic") as HTMLElement;
const settingsButton = $("#toggleSettings") as HTMLElement;
const canvasEl = $("#starry") as HTMLCanvasElement;

let screenHeight = 500;
let isMusicOn = true;

const bgMusic = new Sound("./dist/assets/audio/bgMusic.ogg");
const obsts = new Obstacles(".obstacle");
const scoreSystem = new Score();
let player: Character;

const init = () => {
  const resetScores = $("#resetScores") as HTMLElement;

  AddStars(canvasEl);
  fetchMusicPreference();
  scoreSystem.updateLeaderboard();
  screenHeight = document.documentElement.clientHeight;
  player = new Character("#character", obsts.width, screenHeight);
  // Create random holes in pipes
  obsts.createHoles();

  // Play button click handler
  playBtn.addEventListener("click", startGame);

  // Music button setting listener
  musicBtn.addEventListener("click", setMusicPreference);

  // Reset scores listener
  resetScores.addEventListener("click", () => {
    scoreSystem.resetLeaderBoard();
  });

  // Settings button event listener
  settingsButton.addEventListener("click", toggleSettings);

  // Re-start game on window re-size
  window.onresize = () => {
    init();
  };
};

const toggleSettings = (e: MouseEvent) => {
  e.preventDefault();
  e.stopImmediatePropagation();

  const modal = $("#settingsModal") as HTMLElement;
  const author = $("#authorName") as HTMLElement;

  if (modal.classList.contains("lsil")) {
    settingsButton.classList.remove("rotateR");
    settingsButton.classList.add("rotateL");
    modal.classList.remove("lsil");
    modal.classList.add("bod");
    setTimeout(() => {
      modal.classList.add("hidden");
      modal.classList.remove("bod");
      author.classList.remove("animatedText");
    }, 1500);
  } else {
    settingsButton.classList.remove("rotateL");
    settingsButton.classList.add("rotateR");
    author.classList.add("animatedText");
    modal.classList.remove("hidden");
    modal.classList.add("lsil");
  }
};

const fetchMusicPreference = () => {
  const musicPref = localStorage.getItem(__MUSIC_PREF_KEY__) || "false";
  isMusicOn = musicPref === "true";

  toggleMusicPrefBtn();
};

const toggleMusicPrefBtn = () => {
  const toggelClass = "btn--checked";

  if (isMusicOn) {
    musicBtn.classList.remove(toggelClass);
  } else {
    musicBtn.classList.add(toggelClass);
  }
};

const setMusicPreference = () => {
  isMusicOn = !isMusicOn;
  toggleMusicPrefBtn();

  const musicPrefVal = isMusicOn.toString();
  localStorage.setItem(__MUSIC_PREF_KEY__, musicPrefVal);
};

const playBgMusic = () => {
  if (isMusicOn) {
    bgMusic.loopOn();
    bgMusic.play();
  }
};

const startGame = () => {
  // Reset pipe positions
  obsts.resetPosition();
  // Play background music in loop
  playBgMusic();
  // Enable player jumping controls
  player.enableJumping();
  // Remove overlay
  overlay.classList.add("hidden");
  player.initiateGravity(screenHeight, hitDetection);

  obsts.move();
};

const hitDetection = (gravity: number) => {
  if (
    player.isHit(screenHeight, {
      pipe1Left: obsts.getLeftOf(0),
      pipe2Left: obsts.getLeftOf(1),
      hole1Top: obsts.getHoleTop(0, screenHeight),
      hole2Top: obsts.getHoleTop(1, screenHeight),
    })
  ) {
    clearInterval(gravity);
    gameOver();
  }
};

const showGameOverInfo = () => {
  const lastScoreMsg = $("#c_lastscore") as HTMLElement;
  const gameOverText = $("#gameOverText") as HTMLElement;
  const greet = $("#greet") as HTMLElement;
  gameOverText.classList.remove("hidden");
  lastScoreMsg.classList.remove("hidden");
  greet.classList.add("hidden");
};

const gameOver = () => {
  const lastScore = $("#lastScore") as HTMLElement;

  player.stopJumping();
  player.destroyJumping();

  if (isMusicOn) {
    // Stop background music
    bgMusic.stop();
    const hitSound = new Sound("./dist/assets/audio/hit.mp3");
    hitSound.play();
  }

  scoreSystem.save(obsts.score);
  showGameOverInfo();
  lastScore.innerText = `${obsts.score}`;
  overlay.classList.remove("hidden");
  lastScore.classList.add("highlight");

  setTimeout(() => {
    lastScore.classList.remove("highlight");
  }, 1500);

  obsts.score = 0;
  obsts.pause();
  playBtn.innerText = "Play Again";
};

document.addEventListener("DOMContentLoaded", function () {
  // Initialize the game!
  init();
});
