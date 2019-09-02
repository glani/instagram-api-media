import {Dimensions} from './geometry/Dimensions';
import {Rectangle} from './geometry/Rectangle';

export enum FeedTypeEnum {
    FEED_TIMELINE = 1,
    FEED_TIMELINE_ALBUM = 2,
    FEED_STORY = 3,
    FEED_DIRECT = 4,
    FEED_DIRECT_STORY = 5,
    FEED_TV = 6,
}

export enum OperationEnum {
    CROP = 'CROP',
    EXPAND = 'EXPAND',
}

export interface SimpleColor {
    red: number;
    green: number;
    blue: number;
}

export interface Rounding {
    name: string;
    roundingFunc: (a: number) => number;
}

export enum RoundingFunc {
    round = 'round',
    floor = 'floor',
    ceil = 'ceil',
}

export const RoundingFunctions: Map<RoundingFunc, Rounding> = new Map([
    [RoundingFunc.round, {name: RoundingFunc.round, roundingFunc: Math.round}],
    [RoundingFunc.floor, {name: RoundingFunc.floor, roundingFunc: Math.floor}],
    [RoundingFunc.ceil, {name: RoundingFunc.ceil, roundingFunc: Math.ceil}],
]);

export enum ImageType {
    IMAGETYPE_JPEG = 'IMAGETYPE_JPEG',
    IMAGETYPE_PNG = 'IMAGETYPE_PNG',
}

export interface CalculatedValue {
    src: Rectangle;
    dst: Rectangle;
    canvas: Dimensions;
}

export interface CalculatedCanvas {
    canvas: Dimensions;
    mod2WidthDiff: number;
    mod2HeightDiff: number;
}

export class ClampedInteger {
    protected readonly min = Number.MIN_SAFE_INTEGER;
    protected readonly max = Number.MAX_SAFE_INTEGER;

    constructor(private rawValue: number) {
    }

    public valueOf(): number {
        return this.value;
    }

    public get value(): number {
        return this.clamp(Math.trunc(this.rawValue));
    }

    private clamp(v: number) {
        if (v < this.min) {
            return this.min;
        }
        if (v > this.max) {
            return this.max;
        }
        return v;
    }
}

// tslint:disable-next-line:max-classes-per-file
export class CropFocus extends ClampedInteger {
    protected readonly min = -50;
    protected readonly max = 50;
}
