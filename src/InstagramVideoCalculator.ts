import {InstagramMedia} from './InstagramMedia';
import {InstagramMediaCalculator} from './InstagramMediaCalculator';
import {InstagramVideo} from './InstagramVideo';

export class InstagramVideoCalculator extends InstagramMediaCalculator {
    private instagramVideo: InstagramVideo;

    constructor(instagramVideo: InstagramVideo) {
        super();
        this.instagramVideo = instagramVideo;
    }

    public getInstagramMedia(): InstagramMedia {
        return this.instagramVideo;
    }
}
