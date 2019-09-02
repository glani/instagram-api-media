export interface ConstraintsInterface {
    getTitle(): string;

    getMinAspectRatio(): number;

    getMaxAspectRatio(): number;

    getRecommendedRatio(): number;

    getRecommendedRatioDeviation(): number;

    useRecommendedRatioByDefault(): boolean;

    getMinDuration(): number;

    getMaxDuration(): number;
}

export abstract class BaseConstraints implements ConstraintsInterface {
    protected readonly MIN_RATIO: number = 0.8;
    protected readonly MAX_RATIO: number = 1.91;
    protected readonly RECOMMENDED_RATIO: number = 1.0;
    protected readonly RECOMMENDED_RATIO_DEVIATION: number = 0.0;
    protected readonly MIN_DURATION: number = 3.0;
    protected readonly MAX_DURATION: number = 60.0;
    protected readonly TITLE: string = '';

    public getMaxAspectRatio(): number {
        return this.MAX_RATIO;
    }

    public getMaxDuration(): number {
        return this.MAX_DURATION;
    }

    public getMinAspectRatio(): number {
        return this.MIN_RATIO;
    }

    public getMinDuration(): number {
        return this.MIN_DURATION;
    }

    public getRecommendedRatio(): number {
        return this.RECOMMENDED_RATIO;
    }

    public getRecommendedRatioDeviation(): number {
        return this.RECOMMENDED_RATIO_DEVIATION;
    }

    public getTitle(): string {
        return this.TITLE;
    }

    public useRecommendedRatioByDefault(): boolean {
        return false;
    }

}

export class TimelineConstraints extends BaseConstraints {
    protected readonly TITLE = 'timeline';
}

export class AlbumConstraints extends BaseConstraints {
    protected readonly TITLE = 'album';
}

export class DirectConstraints extends BaseConstraints {
    protected readonly TITLE = 'direct';
    protected readonly MIN_DURATION = 1.0;
    protected readonly MAX_DURATION = 15.0;
}

export class StoryConstraints extends BaseConstraints {
    protected readonly TITLE = 'story';
    protected readonly MIN_RATIO: number = 0.56;
    protected readonly MAX_RATIO: number = 0.67;
    protected readonly RECOMMENDED_RATIO: number = 0.5625;
    protected readonly RECOMMENDED_RATIO_DEVIATION: number = 0.0025;
    protected readonly MIN_DURATION = 1.0;
    protected readonly MAX_DURATION = 15.0;

    public useRecommendedRatioByDefault(): boolean {
        return true;
    }
}

export class DirectStoryConstraints extends BaseConstraints {
    protected readonly TITLE = 'direct story';
}

export class TvConstraints extends BaseConstraints {
    protected readonly TITLE = 'tv';
    protected readonly MIN_RATIO: number = 0.5;
    protected readonly MAX_RATIO: number = 0.8;
    protected readonly MIN_DURATION = 15.0;
    protected readonly MAX_DURATION = 600.0;
}
