import Star from "./Stars";
import { starColors } from "./Constants";

export default function AddStars(canvasEl: HTMLCanvasElement): void {
  const canvas = canvasEl;
  const c = canvas.getContext("2d")!;

  const setCanvasWidth = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  setCanvasWidth();

  let stars: Star[] = [];

  const initializeStars = (starCount: number) => {
    for (let i = 0; i < starCount; i++) {
      //keep these private variables so a new color and radius is generated with every count of the loop
      const randomColorIndex = Math.floor(Math.random() * 5);
      const randomRadius = Math.random() * 2;
      //need to extend canvas by 400px to make sure stars fill out to and past the edge of the window no matter the size
      const x = Math.random() * (canvas.width + 400) - (canvas.width + 400) / 2; //add the extension amount to the canvas size and divide by 2 to ensure stars evenly distributed around center pivot point
      const y = Math.random() * (canvas.width + 400) - (canvas.width + 400) / 2;
      stars.push(new Star(c, x, y, randomRadius, starColors[randomColorIndex]));
    }
  };

  const renderStars = () => {
    c.save();

    c.fillStyle = `rgba(18, 18, 18, 1)`;

    c.fillRect(0, 0, canvas.width, canvas.height);
    c.translate(canvas.width / 2, canvas.height / 2);

    for (let i = 0; i < stars.length; i++) {
      stars[i].update();
    }
  };

  const init = () => {
    stars = [];
    initializeStars(2000);
    renderStars();
  };

  init();

  //when window is resized, re-establish canvas size and initialize stars
  window.addEventListener("resize", () => {
    setCanvasWidth();

    stars = [];
    init();
  });
}
