import {sprintf} from 'sprintf-js';
import {ConstraintsInterface} from './Constraints';
import {ImageType} from './Types';

export abstract class MediaDetails {
    protected readonly MIN_WIDTH: number = Number.MAX_SAFE_INTEGER;
    protected readonly MAX_WIDTH: number = Number.MAX_SAFE_INTEGER;
    private filesize: number;

    private filename: string;

    private width: number;

    private height: number;

    constructor(
        filename: string,
        filesize: number,
        width: number,
        height: number) {
        this.filename = filename;
        this.filesize = filesize;
        this.width = width;
        this.height = height;
    }

    public getWidth(): number {
        return this.hasSwappedAxes() ? this.height : this.width;
    }

    public getHeight(): number {
        return this.hasSwappedAxes() ? this.width : this.height;
    }

    public getAspectRatio(): number {
        return (this.getWidth() / this.getHeight());
    }

    public getFilename(): string {
        return this.filename;
    }

    public getFilesize(): number {
        return this.filesize;
    }

    public getBasename() {
        // Fix full path disclosure.
        return basename(this.filename);
    }

    public getMinAllowedWidth() {
        return this.MIN_WIDTH;
    }

    public getMaxAllowedWidth() {
        return this.MAX_WIDTH;
    }

    public abstract hasSwappedAxes(): boolean;

    /**
     * Check whether the media is horizontally flipped.
     *
     * ```
     * *****      *****
     * *              *
     * ***    =>    ***
     * *              *
     * *              *
     * ```
     *
     */
    public abstract isHorizontallyFlipped(): boolean;

    /**
     * Check whether the media is vertically flipped.
     *
     * ```
     * *****      *
     * *          *
     * ***    =>  ***
     * *          *
     * *          *****
     * ```
     *
     */
    public abstract isVerticallyFlipped(): boolean;

    public validate(constraints: ConstraintsInterface) {
        const mediaFilename = this.getBasename();

        // Check rotation.
        if (this.hasSwappedAxes() || this.isVerticallyFlipped() || this.isHorizontallyFlipped()) {
            throw new Error(sprintf(
                'Instagram only accepts non-rotated media. Your file "%1s" is either rotated or flipped or both.',
                mediaFilename));
        }

        // Check Aspect Ratio.
        // NOTE: This Instagram rule is the same for both videos and photos.
        const aspectRatio = this.getAspectRatio();
        const minAspectRatio = constraints.getMinAspectRatio();
        const maxAspectRatio = constraints.getMaxAspectRatio();
        if (aspectRatio < minAspectRatio || aspectRatio > maxAspectRatio) {
            throw new Error(sprintf(
                'Instagram only accepts %1s media with aspect ratios between %2$.3f and %3$.3f. Your file "%4$" has a %5$.4f aspect ratio.',
                constraints.getTitle(), minAspectRatio, maxAspectRatio, mediaFilename, aspectRatio));
        }
    }
}

export class PhotoDetails extends MediaDetails {
    protected readonly MIN_WIDTH: number = 320;
    protected readonly MAX_WIDTH: number = 1080;
    protected readonly DEFAULT_ORIENTATION = 1;
    private type: ImageType;
    private orientation: number;

    constructor(filename: string, filesize: number, width: number, height: number, type: ImageType, orientation?: number) {
        super(filename, filesize, width, height);
        this.type = type;
        this.orientation = orientation === undefined ? this.DEFAULT_ORIENTATION : orientation;
    }

    public getType(): ImageType {
        return this.type;
    }

    public hasSwappedAxes(): boolean {
        return [5, 6, 7, 8].indexOf(this.orientation) !== -1;
    }

    public isHorizontallyFlipped(): boolean {
        return [2, 3, 6, 7].indexOf(this.orientation) !== -1;
    }

    public isVerticallyFlipped(): boolean {
        return [3, 4, 7, 8].indexOf(this.orientation) !== -1;
    }

    public validate(constraints: ConstraintsInterface) {
        super.validate(constraints);
        const mediaFilename = this.getBasename();
        const type = this.getType();
        if (type !== ImageType.IMAGETYPE_JPEG) {
            throw new Error(sprintf('The photo file "%1s" is not a JPEG file.', mediaFilename));
        }

        const width = this.getWidth();
        // Validate photo resolution. Instagram allows between 320px-1080px width.
        if (width < this.getMinAllowedWidth() || width > this.getMaxAllowedWidth()) {
            throw new Error(sprintf(
                'Instagram only accepts photos that are between %1d and %2d pixels wide. Your file "%3s" is $4d pixels wide.',
                this.MIN_WIDTH, this.MAX_WIDTH, mediaFilename, width));
        }
    }
}

export class VideoDetails extends MediaDetails {
    protected readonly MIN_WIDTH: number = 480;
    protected readonly MAX_WIDTH: number = 720;

    private duration: number;

    private videoCodec: string;

    private audioCodec?: string;

    private container: string;

    private rotation: number;

    private hasRotationMatrixValue: boolean;

    constructor(filename: string,
                filesize: number,
                width: number,
                height: number,
                duration: number,
                videoCodec: string,
                audioCodec: string,
                container: string,
                rotation: number,
                hasRotationMatrixValue: boolean) {
        super(filename, filesize, width, height);
        this.duration = duration;
        this.videoCodec = videoCodec;
        this.audioCodec = audioCodec;
        this.container = container;
        this.rotation = rotation;
        this.hasRotationMatrixValue = hasRotationMatrixValue;
    }

    public getDuration(): number {
        return this.duration;
    }

    public getDurationInMsec(): number {
        // NOTE: ceil() is to round up and get rid of any MS decimals.
        return Math.ceil(this.getDuration() * 1000);
    }

    public getVideoCodec(): string {
        return this.videoCodec;
    }

    public getAudioCodec(): string | undefined {
        return this.audioCodec;
    }

    public getContainer() {
        return this.container;
    }

    public hasSwappedAxes(): boolean {
        return this.rotation % 180 !== 0;
    }

    public isHorizontallyFlipped(): boolean {
        return this.rotation === 90 || this.rotation === 180;
    }

    public isVerticallyFlipped(): boolean {
        return this.rotation === 180 || this.rotation === 270;
    }

    public hasRotationMatrix(): boolean {
        return this.hasRotationMatrixValue;
    }

    public validate(constraints: ConstraintsInterface) {
        super.validate(constraints);

        // WARNING TO CONTRIBUTORS: $mediaFilename is for ERROR DISPLAY to
        // users. Do NOT use it to read from the hard disk!
        const mediaFilename = this.getBasename();

        // Make sure we have found at least one video stream.
        if (this.videoCodec === null) {
            throw new Error(sprintf(
                'Instagram requires video with at least one video stream. Your file "%1s" doesn\'t have any.',
                mediaFilename));
        }

        // Check the video stream. We should have at least one.
        if (this.videoCodec !== 'h264') {
            throw new Error(sprintf(
                'Instagram only accepts videos encoded with the H.264 video codec. Your file "%1s" has "%2s".',
                mediaFilename, this.videoCodec));
        }

        // Check the audio stream (if available).
        if (this.audioCodec !== null && this.audioCodec !== 'aac') {
            throw new Error(sprintf(
                'Instagram only accepts videos encoded with the AAC audio codec. Your file "%1s" has "%2s".',
                mediaFilename, this.audioCodec));
        }

        // Check the container format.
        if (this.container.indexOf('mp4') === -1) {
            throw new Error(sprintf(
                'Instagram only accepts videos packed into MP4 containers. Your file "%1s" has "%2s".',
                mediaFilename, this.container));
        }

        // Validate video resolution. Instagram allows between 480px-720px width.
        // NOTE: They'll resize 720px wide videos on the server, to 640px instead.
        // NOTE: Their server CAN receive between 320px-1080px width without
        // rejecting the video, but the official app would NEVER upload such
        // resolutions. It's controlled by the "ig_android_universe_video_production"
        // experiment variable, which currently enforces width of min:480, max:720.
        // If users want to upload bigger videos, they MUST resize locally first!
        const width = this.getWidth();
        if (width < this.MIN_WIDTH || width > this.MAX_WIDTH) {
            throw new Error(sprintf(
                'Instagram only accepts videos that are between %d and %d pixels wide. Your file "%1s" is %2d pixels wide.',
                this.MIN_WIDTH, this.MAX_WIDTH, mediaFilename, width));
        }

        // Validate video length.
        // NOTE: Instagram has no disk size limit, but this length validation
        // also ensures we can only upload small files exactly as intended.
        const duration = this.getDuration();
        const minDuration = constraints.getMinDuration();
        const maxDuration = constraints.getMaxDuration();
        if (duration < minDuration || duration > maxDuration) {
            throw new Error(sprintf(
                'Instagram only accepts %1s videos that are between %2$.3f and %3$.3f seconds long. Your video "$4s" is %5$.3f seconds long.',
                constraints.getTitle(), minDuration, maxDuration, mediaFilename, duration));
        }
    }

    private normalizeRotation(rotation: number): number {
        // The angle must be in 0..359 degrees range.
        let result = rotation % 360;
        // Negative angle can be normalized by adding it to 360:
        // 360 + (-90) = 270.
        if (result < 0) {
            result = 360 + result;
        }
        // The final angle must be one of 0, 90, 180 or 270 degrees.
        // So we are rounding it to the closest one.
        result = Math.round(result / 90) * 90;

        return result;
    }

}
