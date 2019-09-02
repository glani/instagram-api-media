import {BaseOptions} from './BaseOptions';
import {InstagramMedia} from './InstagramMedia';
import {MediaDetails, PhotoDetails} from './MediaDetails';

export class InstagramPhoto extends InstagramMedia {
    private details: PhotoDetails;

    constructor(details: PhotoDetails, options?: BaseOptions) {
        super(options);
        this.details = details;
    }

    public getMediaDetails(): MediaDetails {
        return this.details;
    }

    protected isMod2CanvasRequired(): boolean {
        return false;
    }

}
