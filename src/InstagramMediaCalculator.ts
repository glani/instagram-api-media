import {InstagramMedia} from './InstagramMedia';
import {CalculatedValue} from './Types';
import {Dimensions} from './geometry/Dimensions';
import {Rectangle} from './geometry/Rectangle';

export abstract class InstagramMediaCalculator {

    public calculate(): CalculatedValue {
        const media = this.getInstagramMedia();
        if (media.shouldProcess()) {
            return media.calculate();
        } else {
            return {
                dst: new Rectangle(0, 0, media.getMediaDetails().getWidth(), media.getMediaDetails().getHeight()),
                src: new Rectangle(0, 0, media.getMediaDetails().getWidth(), media.getMediaDetails().getHeight()),
                canvas: new Dimensions(media.getMediaDetails().getWidth(), media.getMediaDetails().getHeight()),
            };
        }
    }

    public abstract getInstagramMedia(): InstagramMedia;
}
