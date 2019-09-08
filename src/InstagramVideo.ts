import {BaseOptions} from './BaseOptions';
import {InstagramMedia} from './InstagramMedia';
import {MediaDetails, VideoDetails} from './MediaDetails';

export class InstagramVideo extends InstagramMedia {
    private details: VideoDetails;

    constructor(details: VideoDetails, options?: BaseOptions) {
        super(options);
        this.details = details;
    }

    public getMediaDetails(): MediaDetails {
        return this.details;
    }

    protected isMod2CanvasRequired(): boolean {
        return true;
    }
}
