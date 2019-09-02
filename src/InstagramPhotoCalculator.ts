import {InstagramMedia} from './InstagramMedia';
import {InstagramMediaCalculator} from './InstagramMediaCalculator';
import {InstagramPhoto} from './InstagramPhoto';

export class InstagramPhotoCalculator extends InstagramMediaCalculator {
    private instagramPhoto: InstagramPhoto;

    constructor(instagramPhoto: InstagramPhoto) {
        super();
        this.instagramPhoto = instagramPhoto;
    }

    public getInstagramMedia(): InstagramMedia {
        return this.instagramPhoto;
    }
}
