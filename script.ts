interface ICharacterDimensions {
  top?: number;
  height: number;
  width: number;
  left: number;
}

interface ITopScore {
  [timestamp: string]: number;
}

type StyleValue = string | number;


const pipes = document.querySelectorAll('.pipe');
const holes = document.querySelectorAll('.hole');
const obstacles: NodeListOf<HTMLElement> = document.querySelectorAll('.obstacle');
const character = document.getElementById('character')!;
const playBtn = document.getElementById('startGameBtn')!;
const overlay = document.querySelector('.overlay')!;
const topScoreElem = document.getElementById('tScore')!;
const currentScore = document.getElementById('cScore')!;
const lastScore = document.getElementById('lastScore')!;
const lastScoreMsg = document.querySelector('.lastscore')!;
const greet = document.querySelector('.greet')!;
const gameOverText = document.querySelector('.gameOverText')!;
const leaderboard = document.getElementById('leaderboard')!;
const musicBtn = document.getElementById('toggleMusic')!;
const resetScores = document.getElementById('resetScores')!;
const settingsButton = document.getElementById('toggleSettings')!;
const author = document.querySelector('.authorName')!;
const headerHeight = 80;
const __LEADERBOARD_KEY__ = 'tsSRLB';
const __MUSIC_PREF_KEY__ = 'tsSRMP';
const pipeColorPalette = [
  "#f2002c", // red
  "#fcf242", // yellow
  "#1cc8f5", // blue
  "#66ff00", // green
  "#01f9c6", // teal
  "#0ff0fc", // cyan
  "#ffcf00", // orange
  "#dfff11", // lime
  "#bf00ff", // purple
];

let jumpInterval: number;
let screenHeight = 500;
let isJumping = false;
let score = 0;
let lowestScore = 0;
let topScores: Array<ITopScore> = [];
let isMusicOn = true;

class Sound {
  sound: HTMLAudioElement;
  constructor(src: string) {
    this.sound = document.createElement('audio');
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
  }

  play() {
    this.sound.play();
  }

  stop() {
    this.sound.pause();
  }

  loopOn() {
    this.sound.loop = true;
  }

  loopOff() {
    this.sound.loop = false;
  }
}

const bgMusic = new Sound('./audio/bgMusic.ogg');

const getStyle = (el: HTMLElement, prop: string):StyleValue => {
  if(!(el && prop)) {
    throw new Error('Element and property name must be passed');
  }

  return parseInt(window.getComputedStyle(el).getPropertyValue(prop));
};

const getTranslateX = (el: HTMLElement) => {
  const style = window.getComputedStyle(el);
  const matrix = new WebKitCSSMatrix(style.webkitTransform);
  return matrix.m41;
}

// Character Dimensions
const cd: ICharacterDimensions = {
  height: getStyle(character, 'height') as number,
  width: getStyle(character, 'width') as number,
  left: getStyle(character, 'left') as number
};
const obstacleWidth = getStyle(obstacles[0] as HTMLElement, 'width');
const characterZone = cd.left + cd.width;
const obstacleCleared = characterZone - (obstacleWidth as number);

const init = () => {
  fetchMusicPreference();
  updateLeaderboard();
  screenHeight = document.documentElement.clientHeight;
  // Create random holes in pipes
  createRandomHoles();

  // Play button click handler
  playBtn.addEventListener('click', startGame);

  // Music button setting listener
  musicBtn.addEventListener('click', setMusicPreference);

  // Reset scores listener
  resetScores.addEventListener('click', resetLeaderBoardScores);

  // Settings button event listener
  settingsButton.addEventListener('click', toggleSettings);

  // Update window height on browser resize
  window.onresize = () => {
    screenHeight = document.documentElement.clientHeight;
  };
};

const toggleSettings = (e: MouseEvent) => {
  e.preventDefault();
  e.stopImmediatePropagation();

  const modal = document.getElementById('settingsModal')!;

  if(modal.classList.contains('lsil')) {
    settingsButton.classList.remove('rotateR');
    settingsButton.classList.add('rotateL');
    modal.classList.remove('lsil');
    modal.classList.add('bod');
    setTimeout(() => {
      modal.classList.add('hidden');
      modal.classList.remove('bod');
      author.classList.remove('animatedText');
    }, 1500);
  } else {
    settingsButton.classList.remove('rotateL');
    settingsButton.classList.add('rotateR');
    author.classList.add('animatedText');
    modal.classList.remove('hidden');
    modal.classList.add('lsil');
  }
};

const fetchMusicPreference = () => {
  const musicPref = localStorage.getItem(__MUSIC_PREF_KEY__) || 'false';
  console.log('musicPref', musicPref);
  isMusicOn = musicPref === 'true';

  toggleMusicPrefBtn();
};

const toggleMusicPrefBtn = () => {
  const toggelClass = 'btn--checked';

  if(isMusicOn) {
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
  setTimeout(() => {
    updateLeaderboard();
  }, 100);
};

const getReadableDate = (timestamp: number): string => {
  if(timestamp !== NaN) {
    const dt = new Date(timestamp);
    return dt.toLocaleDateString();
  }
  return 'A few days ago!';
};

const getSortedScore = (scores: ITopScore[]) => {
  return scores.sort((a, b) => {
    const valA = (Object.values(a))[0];
    const valB = (Object.values(b))[0];
    return valB - valA;
  });
};

const updateLeaderboard = () => {
  const scores: Array<ITopScore> = topScores && topScores.length ? topScores :
    JSON.parse(localStorage.getItem(__LEADERBOARD_KEY__) || '[]');

  if(scores.length) {
    // Sorting array in descending order
    topScores = getSortedScore(scores);
    topScoreElem.innerText = '' + Object.values(topScores[0])[0];
    lowestScore = Object.values(topScores[topScores.length - 1])[0];

    const listItems = topScores.reduce((acc, score) => {
      const timestamp = Number(Object.keys(score)[0]);
      const scoreVal = score[timestamp];
      let date = getReadableDate(timestamp);
      date = date.padStart(50 - (('' + scoreVal).length + date.length), '.');
      acc = acc + `<li class="lbScore"><span>${scoreVal}</span>${date}</li>`;
      return acc;
    }, '');

    leaderboard.innerHTML = listItems;
  } else {
    leaderboard.innerHTML = '';
    topScoreElem.innerText = '';
    lowestScore = 0;
  }
};

const randomHoleFn = (o: HTMLElement) => {
  // It should return -35 to -95
  const random = -((Math.random() * 60) + 35);
  const hole = o.querySelector('.hole')! as HTMLElement;
  const topPos = (100 + random) + '%';
  const bottomPos = (125 + random) + '%';
  const pipe = o.querySelector('.pipe')! as HTMLElement;
  const pipeColor = pipeColorPalette[Math.floor(Math.random() * pipeColorPalette.length)];;
  const backgroundVal = `linear-gradient(
    ${pipeColor} ${topPos},
    transparent ${topPos},
    transparent ${bottomPos},
    ${pipeColor} ${bottomPos}
  )`;
  hole.style.top = random + '%';
  pipe.style.backgroundImage = backgroundVal;
};

const updateScore = () => {
  score = score + 10;
  currentScore.innerText = score.toString();
};

const createRandomHoles = () => {
  obstacles.forEach(o => {
    randomHoleFn(o);
    o.addEventListener('animationiteration', () => {
      randomHoleFn(o);
      updateScore();
    });
  });
};

const movePipes = () => {
  obstacles.forEach((o) => {
    o.classList.add('moving');
  });
};

const resetPipesPosition = () => {
  let initialPosition = 50;
  obstacles.forEach((o) => {
    initialPosition = initialPosition + 25;
    o.style.transform = `translateX(${initialPosition}vw)`;
  });
};

const pausePipes = () => {
  obstacles.forEach((o) => {
    const pipeLeft = getTranslateX(o) + 3;
    o.classList.remove('moving');
    o.style.transform = `translateX(${pipeLeft}px)`;
  });
};

const playBgMusic = () => {
  if(isMusicOn) {
    bgMusic.loopOn();
    bgMusic.play();
  }
}

const startGame = () => {
  // Reset pipe positions
  resetPipesPosition();
  // Play background music in loop
  playBgMusic();
  // Reset character's position to top
  character.style.top = headerHeight + 'px';
  // Remove overlay
  overlay.classList.add('hidden');
  initiateGravity();

  // Jump character on mouse click or SPACEBAR press
  document.addEventListener('click', jump);
  document.addEventListener('keyup', jumpOnKeypress);

  movePipes();
};

const jumpOnKeypress = (e: KeyboardEvent) => {
  if(e.key === ' ') {
    jump();
  }
}

const hitDetection = (characterTop: number, gravity: number) => {
  const obstacle = {
    pipe1Left: getTranslateX(obstacles[0] as HTMLElement) as number,
    pipe2Left: getTranslateX(obstacles[1] as HTMLElement) as number,
    hole1Top: screenHeight + headerHeight + (getStyle(holes[0] as HTMLElement, 'top') as number),
    hole2Top: screenHeight + headerHeight + (getStyle(holes[1] as HTMLElement, 'top') as number)
  };
  // const cTop = -(screenHeight - characterTop);
  // Height of hole is 25% of pipe's height
  const clearPassageHeight = ((screenHeight - headerHeight) * 0.25) - cd.height;
  // When top of character exceeds the screenHeight - characterHeight, bottom is reached
  const characterHitsBottom = characterTop > (screenHeight - cd.height);
  // Pipe's left is > character's right and pipe's right is less than character's left.
  const pipe1InCharacterZone = (obstacle.pipe1Left < characterZone) && (obstacle.pipe1Left > obstacleCleared);
  const pipe2InCharacterZone = (obstacle.pipe2Left < characterZone) && (obstacle.pipe2Left > obstacleCleared);
  // Character's top is less than hole's top or more than hole's bottom (complex bcz hole's top is negative)
  const characterHitsHole1 = (characterTop < obstacle.hole1Top) || (characterTop > (obstacle.hole1Top + clearPassageHeight));
  const characterHitsHole2 = (characterTop < obstacle.hole2Top) || (characterTop > (obstacle.hole2Top + clearPassageHeight));
  const characterHitsPipe1 = pipe1InCharacterZone && characterHitsHole1;
  const characterHitsPipe2 = pipe2InCharacterZone && characterHitsHole2;

  if(characterHitsBottom || (characterHitsPipe1 || characterHitsPipe2)) {
    clearInterval(gravity);
    gameOver();
  }
};

const initiateGravity = () => {
  const gravityPx = screenHeight * 0.00633;
  const gravity = setInterval(function() {
    const characterTop = getStyle(character, 'top') as number;

    // Free-fall character if not jumping
    if(!isJumping) {
      character.style.top = (characterTop + gravityPx) + 'px';
    }

    hitDetection(characterTop, gravity);
  }, 10);
};

const storeScore = () => {
  if((topScores.length < 5 || (score > lowestScore && lowestScore !== 0)) && score !== 0) {
    const scoreObj: ITopScore = {
      ['' + Date.now()]: score
    };
    topScores.push(scoreObj);
    const sortedScores = getSortedScore(topScores);
    // Keeping only top 10 scores
    topScores = sortedScores.slice(0, 10);
    localStorage.setItem(__LEADERBOARD_KEY__, JSON.stringify(topScores));
    updateLeaderboard();
  }
};

const showGameOverInfo = () => {
  gameOverText.classList.remove('hidden');
  lastScoreMsg.classList.remove('hidden');
  greet.classList.add('hidden');
};

const gameOver = () => {
  clearInterval(jumpInterval);
  // Prevdnt jumping actions from end-user
  document.removeEventListener('click', jump);
  document.removeEventListener('keyup', jumpOnKeypress);

  if(isMusicOn) {
    // Stop background music
    bgMusic.stop();
    const hitSound = new Sound('./audio/hit.mp3');
    hitSound.play();
  }

  storeScore();
  showGameOverInfo();
  currentScore.innerText = '0';
  lastScore.innerText = '' + score;
  overlay.classList.remove('hidden');
  lastScore.classList.add('highlight');
  setTimeout(() => {
    lastScore.classList.remove('highlight');
  }, 1500);
  score = 0;
  pausePipes();
  playBtn.innerText = 'Play Again';
};

const jump = () => {
  clearInterval(jumpInterval);
  isJumping = true;
  let jumpCount = 0;
  const jumpPx = screenHeight * 0.005274;
  jumpInterval = setInterval(function() {
    const characterTop = getStyle(character, 'top') as number;
    if(characterTop > headerHeight && jumpCount < 15) {
      character.style.top = (characterTop - jumpPx) + 'px';
    }

    if(jumpCount > 20) {
      clearInterval(jumpInterval);
      isJumping = false;
      jumpCount = 0;
    }
    jumpCount++;
  }, 10);
}

// Initialize the game!
init();
