"use strict";
const holes = document.querySelectorAll(".hole");
const obstacles = document.querySelectorAll(".obstacle");
const character = document.getElementById("character");
const playBtn = document.getElementById("startGameBtn");
const overlay = document.querySelector(".overlay");
const topScoreElem = document.getElementById("tScore");
const currentScore = document.getElementById("cScore");
const lastScore = document.getElementById("lastScore");
const lastScoreMsg = document.querySelector(".lastscore");
const greet = document.querySelector(".greet");
const gameOverText = document.querySelector(".gameOverText");
const leaderboard = document.getElementById("leaderboard");
const musicBtn = document.getElementById("toggleMusic");
const resetScores = document.getElementById("resetScores");
const settingsButton = document.getElementById("toggleSettings");
const author = document.querySelector(".authorName");
const headerHeight = 80;
const __LEADERBOARD_KEY__ = "tsSRLB";
const __MUSIC_PREF_KEY__ = "tsSRMP";
const pipeColorPalette = [
    "#f2002c",
    "#fcf242",
    "#1cc8f5",
    "#66ff00",
    "#01f9c6",
    "#0ff0fc",
    "#ffcf00",
    "#dfff11",
    "#bf00ff",
];
let jumpInterval;
let screenHeight = 500;
let isJumping = false;
let score = 0;
let lowestScore = 0;
let topScores = [];
let isMusicOn = true;
class Sound {
    constructor(src) {
        this.sound = document.createElement("audio");
        this.sound.src = src;
        this.sound.setAttribute("preload", "auto");
        this.sound.setAttribute("controls", "none");
        this.sound.style.display = "none";
        document.body.appendChild(this.sound);
    }
    play() {
        void this.sound.play();
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
const bgMusic = new Sound("./audio/bgMusic.ogg");
const getStyle = (el, prop) => {
    if (!(el && prop)) {
        throw new Error("Element and property name must be passed");
    }
    return parseInt(window.getComputedStyle(el).getPropertyValue(prop));
};
const getTranslateX = (el) => {
    const style = window.getComputedStyle(el);
    const matrix = new WebKitCSSMatrix(style.webkitTransform);
    return matrix.m41;
};
const cd = {
    height: getStyle(character, "height"),
    width: getStyle(character, "width"),
    left: getStyle(character, "left"),
};
const obstacleWidth = getStyle(obstacles[0], "width");
const characterZone = cd.left + cd.width;
const obstacleCleared = characterZone - obstacleWidth;
const init = () => {
    fetchMusicPreference();
    updateLeaderboard();
    screenHeight = document.documentElement.clientHeight;
    createRandomHoles();
    playBtn.addEventListener("click", startGame);
    musicBtn.addEventListener("click", setMusicPreference);
    resetScores.addEventListener("click", resetLeaderBoardScores);
    settingsButton.addEventListener("click", toggleSettings);
    window.onresize = () => {
        screenHeight = document.documentElement.clientHeight;
    };
};
const toggleSettings = (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    const modal = document.getElementById("settingsModal");
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
    }
    else {
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
    }
    else {
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
const getReadableDate = (timestamp) => {
    if (isNaN(timestamp)) {
        const dt = new Date(timestamp);
        return dt.toLocaleDateString();
    }
    return "A few days ago!";
};
const getSortedScore = (scores) => {
    return scores.sort((a, b) => {
        const valA = Object.values(a)[0];
        const valB = Object.values(b)[0];
        return valB - valA;
    });
};
const updateLeaderboard = () => {
    const scores = topScores && topScores.length
        ? topScores
        : JSON.parse(localStorage.getItem(__LEADERBOARD_KEY__) || "[]");
    if (scores.length) {
        topScores = getSortedScore(scores);
        topScoreElem.innerText = `${Object.values(topScores[0])[0]}`;
        lowestScore = Object.values(topScores[topScores.length - 1])[0];
        const listItems = topScores.reduce((acc, score) => {
            const timestamp = Number(Object.keys(score)[0]);
            const scoreVal = score[timestamp];
            let date = getReadableDate(timestamp);
            date = date.padStart(50 - (`${scoreVal}`.length + date.length), ".");
            acc = acc + `<li class="lbScore"><span>${scoreVal}</span>${date}</li>`;
            return acc;
        }, "");
        leaderboard.innerHTML = listItems;
    }
    else {
        leaderboard.innerHTML = "";
        topScoreElem.innerText = "";
        lowestScore = 0;
    }
};
const randomHoleFn = (o) => {
    const random = -(Math.random() * 60 + 35);
    const hole = o.querySelector(".hole");
    const topPos = `${100 + random}%`;
    const bottomPos = `${125 + random}%`;
    const pipe = o.querySelector(".pipe");
    const pipeColor = pipeColorPalette[Math.floor(Math.random() * pipeColorPalette.length)];
    const backgroundVal = `linear-gradient(
    ${pipeColor} ${topPos},
    transparent ${topPos},
    transparent ${bottomPos},
    ${pipeColor} ${bottomPos}
  )`;
    hole.style.top = `${random}%`;
    pipe.style.backgroundImage = backgroundVal;
};
const updateScore = () => {
    score = score + 10;
    currentScore.innerText = score.toString();
};
const createRandomHoles = () => {
    obstacles.forEach((o) => {
        randomHoleFn(o);
        o.addEventListener("animationiteration", () => {
            randomHoleFn(o);
            updateScore();
        });
    });
};
const movePipes = () => {
    obstacles.forEach((o) => {
        o.classList.add("moving");
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
        o.classList.remove("moving");
        o.style.transform = `translateX(${pipeLeft}px)`;
    });
};
const playBgMusic = () => {
    if (isMusicOn) {
        bgMusic.loopOn();
        bgMusic.play();
    }
};
const startGame = () => {
    resetPipesPosition();
    playBgMusic();
    character.style.top = `${headerHeight}px`;
    overlay.classList.add("hidden");
    initiateGravity();
    document.addEventListener("click", jump);
    document.addEventListener("keyup", jumpOnKeypress);
    movePipes();
};
const jumpOnKeypress = (e) => {
    if (e.key === " ") {
        jump();
    }
};
const hitDetection = (characterTop, gravity) => {
    const obstacle = {
        pipe1Left: getTranslateX(obstacles[0]),
        pipe2Left: getTranslateX(obstacles[1]),
        hole1Top: screenHeight + headerHeight + getStyle(holes[0], "top"),
        hole2Top: screenHeight + headerHeight + getStyle(holes[1], "top"),
    };
    const clearPassageHeight = (screenHeight - headerHeight) * 0.25 - cd.height;
    const characterHitsBottom = characterTop > screenHeight - cd.height;
    const pipe1InCharacterZone = obstacle.pipe1Left < characterZone && obstacle.pipe1Left > obstacleCleared;
    const pipe2InCharacterZone = obstacle.pipe2Left < characterZone && obstacle.pipe2Left > obstacleCleared;
    const characterHitsHole1 = characterTop < obstacle.hole1Top || characterTop > obstacle.hole1Top + clearPassageHeight;
    const characterHitsHole2 = characterTop < obstacle.hole2Top || characterTop > obstacle.hole2Top + clearPassageHeight;
    const characterHitsPipe1 = pipe1InCharacterZone && characterHitsHole1;
    const characterHitsPipe2 = pipe2InCharacterZone && characterHitsHole2;
    if (characterHitsBottom || characterHitsPipe1 || characterHitsPipe2) {
        clearInterval(gravity);
        gameOver();
    }
};
const initiateGravity = () => {
    const gravityPx = screenHeight * 0.00633;
    const gravity = setInterval(function () {
        const characterTop = getStyle(character, "top");
        if (!isJumping) {
            character.style.top = `${characterTop + gravityPx}px`;
        }
        hitDetection(characterTop, gravity);
    }, 10);
};
const storeScore = () => {
    if ((topScores.length < 5 || (score > lowestScore && lowestScore !== 0)) && score !== 0) {
        const scoreObj = {
            [`${Date.now()}`]: score,
        };
        topScores.push(scoreObj);
        const sortedScores = getSortedScore(topScores);
        topScores = sortedScores.slice(0, 10);
        localStorage.setItem(__LEADERBOARD_KEY__, JSON.stringify(topScores));
        updateLeaderboard();
    }
};
const showGameOverInfo = () => {
    gameOverText.classList.remove("hidden");
    lastScoreMsg.classList.remove("hidden");
    greet.classList.add("hidden");
};
const gameOver = () => {
    clearInterval(jumpInterval);
    document.removeEventListener("click", jump);
    document.removeEventListener("keyup", jumpOnKeypress);
    if (isMusicOn) {
        bgMusic.stop();
        const hitSound = new Sound("./audio/hit.mp3");
        hitSound.play();
    }
    storeScore();
    showGameOverInfo();
    currentScore.innerText = "0";
    lastScore.innerText = `${score}`;
    overlay.classList.remove("hidden");
    lastScore.classList.add("highlight");
    setTimeout(() => {
        lastScore.classList.remove("highlight");
    }, 1500);
    score = 0;
    pausePipes();
    playBtn.innerText = "Play Again";
};
const jump = () => {
    clearInterval(jumpInterval);
    isJumping = true;
    let jumpCount = 0;
    const jumpPx = screenHeight * 0.005274;
    jumpInterval = setInterval(function () {
        const characterTop = getStyle(character, "top");
        if (characterTop > headerHeight && jumpCount < 15) {
            character.style.top = `${characterTop - jumpPx}px`;
        }
        if (jumpCount > 20) {
            clearInterval(jumpInterval);
            isJumping = false;
            jumpCount = 0;
        }
        jumpCount++;
    }, 10);
};
init();
