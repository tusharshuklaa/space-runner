interface ICharacterDimensions {
  top?: number;
  height: number;
  width: number;
  left: number;
}

interface ITopScore {
  [timestamp: string]: number;
}

interface IObstacleMeasurements {
  pipe1Left: number;
  pipe2Left: number;
  hole1Top: number;
  hole2Top: number;
}
