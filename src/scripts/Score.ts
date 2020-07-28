import { $, getReadableDate, getSortedScore } from "./Util";
import { __LEADERBOARD_KEY__ } from "./Constants";

export default class Score {
  private topScores: Array<ITopScore>;
  private lowestScore: number;

  constructor() {
    this.topScores = [];
    this.lowestScore = 0;
  }

  updateLeaderboard(): void {
    const topScoreElem = $("#tScore") as HTMLElement;
    const leaderboard = $("#leaderboard") as HTMLElement;

    const scores: Array<ITopScore> =
      this.topScores && this.topScores.length
        ? this.topScores
        : (JSON.parse(localStorage.getItem(__LEADERBOARD_KEY__) || "[]") as Array<ITopScore>);

    if (scores.length) {
      // Sorting array in descending order
      this.topScores = getSortedScore(scores);
      topScoreElem.innerText = `${Object.values(this.topScores[0])[0]}`;
      this.lowestScore = Object.values(this.topScores[this.topScores.length - 1])[0];

      const listItems = this.topScores.reduce((acc, _score) => {
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
      this.lowestScore = 0;
    }
  }

  resetLeaderBoard(): void {
    localStorage.removeItem(__LEADERBOARD_KEY__);
    this.topScores = [];
    setTimeout(() => {
      this.updateLeaderboard();
    }, 100);
  }

  save(score: number): void {
    if (
      !isNaN(score) &&
      (this.topScores.length < 5 || (score > this.lowestScore && this.lowestScore !== 0)) &&
      score !== 0
    ) {
      const scoreObj: ITopScore = {
        [`${Date.now()}`]: score,
      };
      this.topScores.push(scoreObj);
      const sortedScores = getSortedScore(this.topScores);
      // Keeping only top 5 scores
      this.topScores = sortedScores.slice(0, 5);
      localStorage.setItem(__LEADERBOARD_KEY__, JSON.stringify(this.topScores));
      this.updateLeaderboard();
    }
  }
}
