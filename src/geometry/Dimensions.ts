import {RoundingFunc, RoundingFunctions} from '../Types';

export class Dimensions {
    protected width: number;

    protected height: number;

    protected aspectRatio: number;

    constructor(
        width: number,
        height: number) {
        this.width = width;
        this.height = height;

        this.aspectRatio = (this.width / this.height);
    }

    public getWidth() {
        return this.width;
    }

    public getHeight() {
        return this.height;
    }

    public getAspectRatio() {
        return this.aspectRatio;
    }

    public withSwappedAxes(): Dimensions {
        return new Dimensions(this.height, this.width);
    }

    public withRescaling(
        newScale: number = 1.0,
        roundingFuncType: RoundingFunc): Dimensions {

        const v = RoundingFunctions.get(roundingFuncType);
        if (v) {
            const roundingFunc = v.roundingFunc;
            const newWidth = roundingFunc(newScale * this.width);
            const newHeight = roundingFunc(newScale * this.height);

            return new Dimensions(newWidth, newHeight);
        }

        return new Dimensions(this.width, this.height);
    }
}
