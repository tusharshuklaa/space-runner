import Sound from "./sound";
import { $, getStyle, getTranslateX, getReadableDate, getSortedScore } from "./util";
import { headerHeight, __LEADERBOARD_KEY__, __MUSIC_PREF_KEY__ } from "./constants";
import Obstacles from "./obstacles";
import Character from "./character";

const holes = $(".hole") as NodeListOf<HTMLElement>;
const obstacles = $(".obstacle") as NodeListOf<HTMLElement>;
const character = $("#character") as HTMLElement;
const playBtn = $("#startGameBtn") as HTMLElement;
const overlay = $("#overlay") as HTMLElement;
const topScoreElem = $("#tScore") as HTMLElement;
const currentScore = $("#cScore") as HTMLElement;
const lastScore = $("#lastScore") as HTMLElement;
const leaderboard = $("#leaderboard") as HTMLElement;
const musicBtn = $("#toggleMusic") as HTMLElement;
const resetScores = $("#resetScores") as HTMLElement;
const settingsButton = $("#toggleSettings") as HTMLElement;

let screenHeight = 500;
let lowestScore = 0;
let topScores: Array<ITopScore> = [];
let isMusicOn = true;

const bgMusic = new Sound("./dist/assets/audio/bgMusic.ogg");
const obsts = new Obstacles(".obstacle");
let player: Character;

const init = () => {
  fetchMusicPreference();
  updateLeaderboard();
  screenHeight = document.documentElement.clientHeight;
  player = new Character("#character", obsts.width, screenHeight);
  // Create random holes in pipes
  obsts.createHoles(currentScore);

  // Play button click handler
  playBtn.addEventListener("click", startGame);

  // Music button setting listener
  musicBtn.addEventListener("click", setMusicPreference);

  // Reset scores listener
  resetScores.addEventListener("click", resetLeaderBoardScores);

  // Settings button event listener
  settingsButton.addEventListener("click", toggleSettings);

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

const resetLeaderBoardScores = () => {
  localStorage.removeItem(__LEADERBOARD_KEY__);
  topScores = [];
  setTimeout(() => {
    updateLeaderboard();
  }, 100);
};

const updateLeaderboard = () => {
  const scores: Array<ITopScore> =
    topScores && topScores.length
      ? topScores
      : (JSON.parse(localStorage.getItem(__LEADERBOARD_KEY__) || "[]") as Array<ITopScore>);

  if (scores.length) {
    // Sorting array in descending order
    topScores = getSortedScore(scores);
    topScoreElem.innerText = `${Object.values(topScores[0])[0]}`;
    lowestScore = Object.values(topScores[topScores.length - 1])[0];

    const listItems = topScores.reduce((acc, _score) => {
      const timestamp = Number(Object.keys(_score)[0]);
      const scoreVal = _score[timestamp];
      let date = getReadableDate(timestamp);
      date = date.padStart(50 - (`${scoreVal}`.length + date.length), ".");
      acc = acc + `<li class="lbScore"><span>${scoreVal}</span>${date}</li>`;
      return acc;
    }, "");

    leaderboard.innerHTML = listItems;
  } else {
    leaderboard.innerHTML = "";
    topScoreElem.innerText = "";
    lowestScore = 0;
  }
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
  // Reset character's position to top
  character.style.top = `${headerHeight}px`;
  // Remove overlay
  overlay.classList.add("hidden");
  player.initiateGravity(screenHeight, hitDetection);

  obsts.move();
};

const hitDetection = (gravity: number) => {
  if (
    player.isHit(screenHeight, {
      pipe1Left: getTranslateX(obstacles[0]),
      pipe2Left: getTranslateX(obstacles[1]),
      hole1Top: screenHeight + headerHeight + getStyle(holes[0], "top"),
      hole2Top: screenHeight + headerHeight + getStyle(holes[1], "top"),
    })
  ) {
    clearInterval(gravity);
    gameOver();
  }
};

const storeScore = () => {
  const score = obsts.score;
  if (!isNaN(score) && (topScores.length < 5 || (score > lowestScore && lowestScore !== 0)) && score !== 0) {
    const scoreObj: ITopScore = {
      [`${Date.now()}`]: score,
    };
    topScores.push(scoreObj);
    const sortedScores = getSortedScore(topScores);
    // Keeping only top 5 scores
    topScores = sortedScores.slice(0, 5);
    localStorage.setItem(__LEADERBOARD_KEY__, JSON.stringify(topScores));
    updateLeaderboard();
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
  player.stopJumping();
  player.destroyJumping();

  if (isMusicOn) {
    // Stop background music
    bgMusic.stop();
    const hitSound = new Sound("./dist/assets/audio/hit.mp3");
    hitSound.play();
  }

  storeScore();
  showGameOverInfo();
  currentScore.innerText = "0";
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

// Initialize the game!
init();
