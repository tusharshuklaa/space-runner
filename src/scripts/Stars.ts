export default class Star {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  radius: number;
  color: string;
  draw: () => void;
  update: () => void;

  constructor(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.ctx = ctx;

    this.draw = () => {
      //saves current canvas context state
      this.ctx.save();
      //initializing a new path
      this.ctx.beginPath();
      //creates a circle using the x, y, and radius parameters. 0 is for the starting angle, and Math.PI * 2 is the end angle (360 degrees)
      this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = this.color;
      this.ctx.shadowColor = this.color;
      this.ctx.shadowBlur = 15;
      //fills the current drawing using the parameters above
      this.ctx.fill();
      //creates path from current point back to starting point
      this.ctx.closePath();
      //returns the previously saved path state and attributes
      this.ctx.restore();
    };

    //initializes the draw function when called
    this.update = () => {
      this.draw();
    };
  }
}
