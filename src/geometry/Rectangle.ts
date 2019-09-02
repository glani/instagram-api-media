import {RoundingFunc, RoundingFunctions} from '../Types';

export class Rectangle {

    protected x: number;

    protected y: number;

    protected width: number;

    protected height: number;

    protected aspectRatio: number;

    constructor(
        x: number,
        y: number,
        width: number,
        height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.aspectRatio = (this.width / this.height);
    }

    public getX(): number {
        return this.x;
    }

    public getY(): number {
        return this.y;
    }

    public getX1(): number {
        return this.x;
    }

    public getY1(): number {
        return this.y;
    }

    public getX2(): number {
        return this.x + this.width;
    }

    public getY2(): number {
        return this.y + this.height;
    }

    public getWidth(): number {
        return this.width;
    }

    public getHeight(): number {
        return this.height;
    }

    public getAspectRatio(): number {
        return this.aspectRatio;
    }

    public withSwappedAxes(): Rectangle {
        return new Rectangle(this.y, this.x, this.height, this.width);
    }

    public withRescaling(
        newScale: number = 1.0,
        roundingFuncType: RoundingFunc): Rectangle {

        const v = RoundingFunctions.get(roundingFuncType);
        if (v) {
            const roundingFunc = v.roundingFunc;
            const newWidth = roundingFunc(newScale * this.width);
            const newHeight = roundingFunc(newScale * this.height);

            return new Rectangle(this.x, this.y, newWidth, newHeight);
        }
        return new Rectangle(this.x, this.y, this.width, this.height);
    }
}
