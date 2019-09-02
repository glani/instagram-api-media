import {sprintf} from 'sprintf-js';
import {BaseOptions} from './BaseOptions';

import {ConstraintsInterface} from './Constraints';
import {ConstraintsFactory} from './ConstraintsFactory';
import {MediaDetails} from './MediaDetails';
import {Dimensions} from './geometry/Dimensions';
import {Rectangle} from './geometry/Rectangle';

import {
    CalculatedCanvas,
    CalculatedValue,
    CropFocus,
    FeedTypeEnum,
    OperationEnum,
    RoundingFunc,
    SimpleColor,
} from './Types';

export abstract class InstagramMedia  {
    private readonly operation: OperationEnum;
    private readonly targetFeed: FeedTypeEnum;
    private readonly allowNewAspectDeviation?: boolean;
    private readonly bgColor?: SimpleColor;
    private readonly blurredBorder?: boolean;
    private readonly horCropFocus?: CropFocus;
    private readonly maxAspectRatio?: number;
    private readonly minAspectRatio?: number;
    private readonly useRecommendedRatio?: boolean;
    private readonly userForceTargetAspectRatio?: number;
    private readonly verCropFocus?: CropFocus;
    private readonly hasUserForceTargetAspectRatio: boolean;
    private readonly constraints: ConstraintsInterface;
    private readonly forceTargetAspectRatio: number | undefined;

    constructor(options?: BaseOptions) {
        if (options) {
            this.operation = options.operation !== undefined ? options.operation : OperationEnum.CROP;
            this.targetFeed = options.targetFeed !== undefined ? options.targetFeed : FeedTypeEnum.FEED_TIMELINE;
            this.allowNewAspectDeviation = options.allowNewAspectDeviation;
            this.bgColor = options.bgColor;
            this.blurredBorder = options.blurredBorder;
            this.horCropFocus = options.horCropFocus;
            this.maxAspectRatio = options.maxAspectRatio;
            this.minAspectRatio = options.minAspectRatio;
            this.useRecommendedRatio = options.useRecommendedRatio;
            this.userForceTargetAspectRatio = options.userForceTargetAspectRatio;
            this.verCropFocus = options.verCropFocus;
        } else {
            this.operation = OperationEnum.CROP;
            this.targetFeed = FeedTypeEnum.FEED_TIMELINE;
        }

        this.hasUserForceTargetAspectRatio = false;
        if (this.userForceTargetAspectRatio !== undefined) {
            this.hasUserForceTargetAspectRatio = true;
            this.useRecommendedRatio = false;
        }

        this.constraints = ConstraintsFactory.createFor(this.targetFeed);
        if (this.hasUserForceTargetAspectRatio && this.useRecommendedRatio === undefined) {
            if (this.minAspectRatio !== undefined || this.maxAspectRatio !== undefined) {
                this.useRecommendedRatio = false;
            } else {
                this.useRecommendedRatio = this.constraints.useRecommendedRatioByDefault();
            }
        }

        if (!this.hasUserForceTargetAspectRatio && this.useRecommendedRatio) {
            this.forceTargetAspectRatio = this.constraints.getRecommendedRatio();
            const deviation = this.constraints.getRecommendedRatioDeviation();
            this.minAspectRatio = this.forceTargetAspectRatio - deviation;
            this.maxAspectRatio = this.forceTargetAspectRatio + deviation;
        } else {

            const allowedMinRatio = this.constraints.getMinAspectRatio();
            const allowedMaxRatio = this.constraints.getMaxAspectRatio();

            if (this.minAspectRatio !== undefined && (this.minAspectRatio < allowedMinRatio || this.minAspectRatio > allowedMaxRatio)) {
                throw new Error(sprintf('Minimum aspect ratio must be between %1.3f and %2.3f.',
                    allowedMinRatio, allowedMaxRatio));
            }

            if (this.minAspectRatio === undefined) {
                this.minAspectRatio = allowedMinRatio;
            }

            if (this.maxAspectRatio !== undefined && (this.maxAspectRatio < allowedMinRatio || this.maxAspectRatio > allowedMaxRatio)) {
                throw new Error(sprintf('Maximum aspect ratio must be between %1.3f and %2.3f.', allowedMinRatio, allowedMaxRatio));
            }

            if (this.maxAspectRatio === undefined) {
                this.maxAspectRatio = allowedMaxRatio;
            }

            if (this.minAspectRatio > this.maxAspectRatio) {
                throw new Error('Maximum aspect ratio must be greater than or equal to minimum.');
            }

            // Validate custom target aspect ratio legality if provided by user.
            if (this.hasUserForceTargetAspectRatio) {
                this.forceTargetAspectRatio = this.userForceTargetAspectRatio;
                if (this.forceTargetAspectRatio === undefined) {
                    throw new Error('Force target aspect ratio undefined');
                }
                if (this.forceTargetAspectRatio < this.minAspectRatio) {
                    throw new Error(sprintf('Custom target aspect ratio (%1.5f) must be greater than or equal to the minimum aspect ratio (%2.5f).',
                        this.forceTargetAspectRatio, this.minAspectRatio));
                }
                if (this.forceTargetAspectRatio > this.maxAspectRatio) {
                    throw new Error(sprintf('Custom target aspect ratio (%.5f) must be lesser than or equal to the maximum aspect ratio (%.5f).',
                        this.forceTargetAspectRatio, this.maxAspectRatio));
                }
            }
        }

        if (this.allowNewAspectDeviation === undefined) {
            this.allowNewAspectDeviation = false;
        }

        if (this.bgColor === undefined) {
            this.bgColor = {red: 255, green: 255, blue: 255};
        }

        if (this.blurredBorder === undefined) {
            this.blurredBorder = false;
        }

    }

    public abstract getMediaDetails(): MediaDetails;

    public shouldProcess(): boolean {
        const inputAspectRatio = this.getMediaDetails().getAspectRatio();
        if (this.minAspectRatio !== undefined && inputAspectRatio < this.minAspectRatio) {
            return true;
        }

        if (this.maxAspectRatio !== undefined && inputAspectRatio > this.maxAspectRatio) {
            return true;
        }

        if (this.hasUserForceTargetAspectRatio && this.forceTargetAspectRatio) {
            if (this.forceTargetAspectRatio === 1.0) {
                // User wants a SQUARE canvas, which can ALWAYS be achieved (by
                // making both sides equal). Process input if not EXACTLY square.
                // WARNING: Comparison here and above MUST use `!=` (NOT strict
                // `!==`) to support both int(1) and float(1.0) values!
                if (inputAspectRatio !== 1.0) {
                    return true;
                }
            } else {
                // User wants a non-square canvas, which is almost always
                // IMPOSSIBLE to achieve perfectly. Only process if input
                // deviates too much from the desired target.
                const acceptableDeviation = 0.003; // Allow a very narrow range around the user's target.
                const acceptableMinAspectRatio = this.forceTargetAspectRatio - acceptableDeviation;
                const acceptableMaxAspectRatio = this.forceTargetAspectRatio + acceptableDeviation;
                if (inputAspectRatio < acceptableMinAspectRatio || inputAspectRatio > acceptableMaxAspectRatio) {
                    return true;
                }
            }
        }

        try {
            this.getMediaDetails().validate(this.constraints);
            return false;
        } catch (e) {
            return true;
        }
    }

    public calculate(): CalculatedValue {
        const details = this.getMediaDetails();
        const inputCanvas = new Dimensions(details.getWidth(), details.getHeight());
        const canvasInfo = this.calculateNewCanvas( // Throws.
            this.operation,
            inputCanvas.getWidth(),
            inputCanvas.getHeight(),
            this.isMod2CanvasRequired(),
            details.getMinAllowedWidth(),
            details.getMaxAllowedWidth(),
            this.allowNewAspectDeviation,
            this.minAspectRatio,
            this.maxAspectRatio,
            this.forceTargetAspectRatio,
        );

        const outputCanvas = canvasInfo.canvas;
        if (this.operation === OperationEnum.CROP) {
            let overallRescale = 0;
            const idealCanvas = new Dimensions(outputCanvas.getWidth() - canvasInfo.mod2WidthDiff,
                outputCanvas.getHeight() - canvasInfo.mod2HeightDiff);
            const idealWidthScale = (idealCanvas.getWidth() / inputCanvas.getWidth());
            const idealHeightScale = (idealCanvas.getHeight() / inputCanvas.getHeight());
            if (Math.abs(idealCanvas.getAspectRatio() - inputCanvas.getAspectRatio()) < 0.0001) {
                overallRescale = idealWidthScale;
            } else if (idealCanvas.getAspectRatio() < inputCanvas.getAspectRatio()) {
                overallRescale = idealHeightScale;
            } else {
                overallRescale = idealWidthScale;
            }

            let croppedInputCanvas = idealCanvas.withRescaling(1 / overallRescale, RoundingFunc.round);
            const rescaledMod2WidthDiff = Math.round(canvasInfo.mod2WidthDiff * (1 / overallRescale));
            const rescaledMod2HeightDiff = Math.round(canvasInfo.mod2HeightDiff * (1 / overallRescale));
            croppedInputCanvas = new Dimensions(croppedInputCanvas.getWidth() + rescaledMod2WidthDiff,
                croppedInputCanvas.getHeight() + rescaledMod2HeightDiff);

            const croppedInputCanvasWidth = croppedInputCanvas.getWidth() <= inputCanvas.getWidth()
                ? croppedInputCanvas.getWidth() : inputCanvas.getWidth();
            const croppedInputCanvasHeight = croppedInputCanvas.getHeight() <= inputCanvas.getHeight()
                ? croppedInputCanvas.getHeight() : inputCanvas.getHeight();
            croppedInputCanvas = new Dimensions(croppedInputCanvasWidth, croppedInputCanvasHeight);
            let x1 = 0;
            let y1 = 0;
            let x2 = inputCanvas.getWidth();
            let y2 = inputCanvas.getHeight();

            const widthDiff = croppedInputCanvas.getWidth() - inputCanvas.getWidth();
            const heightDiff = croppedInputCanvas.getHeight() - inputCanvas.getHeight();

            if (widthDiff < 0) {
                // Horizontal cropping. Focus on the center by default.
                let horCropFocus = this.horCropFocus !== undefined ? this.horCropFocus.value : 0;

                // Invert the focus if this is horizontally flipped media.
                if (details.isHorizontallyFlipped()) {
                    horCropFocus = -horCropFocus;
                }

                // Calculate amount of pixels to crop and shift them as-focused.
                // NOTE: Always use floor() to make uneven amounts lean at left.
                const absWidthDiff = Math.abs(widthDiff);
                x1 = Math.floor(absWidthDiff * (50 + horCropFocus) / 100);
                x2 = x2 - (absWidthDiff - x1);
            }

            if (heightDiff < 0) {
                // Vertical cropping. Focus on top by default (to keep faces).
                let verCropFocus = this.verCropFocus !== undefined ? this.verCropFocus.value : -50;

                // Invert the focus if this is vertically flipped media.
                if (details.isVerticallyFlipped()) {
                    verCropFocus = -verCropFocus;
                }

                // Calculate amount of pixels to crop and shift them as-focused.
                // NOTE: Always use floor() to make uneven amounts lean at top.
                const absHeightDiff = Math.abs(heightDiff);
                y1 = Math.floor(absHeightDiff * (50 + verCropFocus) / 100);
                y2 = y2 - (absHeightDiff - y1);
            }
            return {
                src: new Rectangle(x1, y1, x2 - x1, y2 - y1),
                dst: new Rectangle(0, 0, outputCanvas.getWidth(), outputCanvas.getHeight()),
                canvas: outputCanvas,
            };
        } else {
            const srcRect = new Rectangle(0, 0, inputCanvas.getWidth(), inputCanvas.getHeight());
            // Determine the target dimensions to fit it on the new canvas,
            // because the input media's dimensions may have been too large.
            // This will not scale anything (uses scale=1) if the input fits.
            const outputWidthScale = (outputCanvas.getWidth() / inputCanvas.getWidth());
            const outputHeightScale = (outputCanvas.getHeight() / inputCanvas.getHeight());
            const scale = Math.min(outputWidthScale, outputHeightScale);

            const dstRect = srcRect.withRescaling(scale, RoundingFunc.ceil);
            const dstX = Math.floor((outputCanvas.getWidth() - dstRect.getWidth()) / 2);
            const dstY = Math.floor((outputCanvas.getHeight() - dstRect.getHeight()) / 2);
            return {
                src: srcRect,
                dst: new Rectangle(dstX, dstY, dstRect.getWidth(), dstRect.getHeight()),
                canvas: outputCanvas,
            };
        }

    }

    protected abstract isMod2CanvasRequired(): boolean;

    private calculateNewCanvas(operation: OperationEnum,
                               inputWidth: number,
                               inputHeight: number,
                               isMod2CanvasRequired: boolean,
                               minWidth: number = 1,
                               maxWidth: number = 99999,
                               allowNewAspectDeviation: boolean = false,
                               minAspectRatio: number | undefined,
                               maxAspectRatio: number | undefined,
                               forceTargetAspectRatio: number | undefined): CalculatedCanvas {
        let targetWidth = inputWidth;
        let targetHeight = inputHeight;
        let targetAspectRatio = inputWidth / inputHeight;

        if (
            (minAspectRatio !== undefined && targetAspectRatio < minAspectRatio)
            || (forceTargetAspectRatio !== undefined && targetAspectRatio < forceTargetAspectRatio)
        ) {
            if (forceTargetAspectRatio !== undefined) {
                targetAspectRatio = forceTargetAspectRatio;
            } else {
                targetAspectRatio = minAspectRatio !== undefined ? minAspectRatio : 0.0;
            }

            if (operation === OperationEnum.CROP) {
                targetHeight = Math.floor(targetWidth / targetAspectRatio);
            } else {
                targetWidth = Math.ceil(targetHeight * targetAspectRatio);
            }
        } else if ((maxAspectRatio !== undefined && targetAspectRatio > maxAspectRatio)
            || (forceTargetAspectRatio !== undefined && targetAspectRatio > forceTargetAspectRatio)) {
            if (forceTargetAspectRatio !== undefined) {
                targetAspectRatio = forceTargetAspectRatio;
            } else {
                targetAspectRatio = maxAspectRatio !== undefined ? maxAspectRatio : 0.0;
            }

            if (operation === OperationEnum.CROP) {
                targetWidth = Math.floor(targetHeight * targetAspectRatio);
            } else {
                targetHeight = Math.ceil(targetWidth / targetAspectRatio);
            }
        }

        const minAspectDistance = Math.abs((minAspectRatio !== undefined
            ? minAspectRatio : 0) - targetAspectRatio);
        const maxAspectDistance = Math.abs((maxAspectRatio !== undefined
            ? maxAspectRatio : 9999999) - targetAspectRatio);

        const useFloorHeightRecalc = (minAspectDistance <= maxAspectDistance);

        if (targetAspectRatio === 1.0 && targetWidth !== targetHeight) { // Ratio 1 = Square.
            targetWidth = targetHeight = operation === OperationEnum.CROP
                ? Math.min(targetWidth, targetHeight)
                : Math.max(targetWidth, targetHeight);
        }

        if (targetWidth > maxWidth) {
            targetWidth = maxWidth;
            targetHeight = this.accurateHeightRecalc(useFloorHeightRecalc, targetAspectRatio, targetWidth);
        } else if (targetWidth < minWidth) {
            targetWidth = minWidth;
            targetHeight = this.accurateHeightRecalc(useFloorHeightRecalc, targetAspectRatio, targetWidth);
        }

        const mod2WidthDiff = 0;
        const mod2HeightDiff = 0;
        if (isMod2CanvasRequired
            && (this.isNumberMod2(targetWidth) || this.isNumberMod2(targetHeight))
        ) {
            // TODO for video
        }

        const canvas = new Dimensions(targetWidth, targetHeight);
        const isIllegalRatio = ((minAspectRatio !== undefined && canvas.getAspectRatio() < minAspectRatio)
            || (maxAspectRatio !== undefined && canvas.getAspectRatio() > maxAspectRatio));
        if (canvas.getWidth() < 1 || canvas.getHeight() < 1) {
            throw new Error(sprintf(
                'Canvas calculation failed. Target width (%1s) or height (%2s) less than one pixel.',
                canvas.getWidth(), canvas.getHeight()));
        } else if (canvas.getWidth() < minWidth) {
            throw new Error(sprintf(
                'Canvas calculation failed. Target width (%1s) less than minimum allowed (%2s).',
                canvas.getWidth(), minWidth));
        } else if (canvas.getWidth() > maxWidth) {
            throw new Error(sprintf(
                'Canvas calculation failed. Target width (%1s) greater than maximum allowed (%2s).',
                canvas.getWidth(), maxWidth));
        } else if (isIllegalRatio) {
            if (!allowNewAspectDeviation) {
                throw new Error(sprintf(
                    'Canvas calculation failed. Unable to reach target aspect ratio range during output canvas generation. ' +
                    'The range of allowed aspect ratios is too narrow (%1.8f - %2.8f). We achieved a ratio of %3.8f.',
                    minAspectRatio !== null ? minAspectRatio : 0.0,
                    maxAspectRatio !== null ? maxAspectRatio : Number.MAX_VALUE,
                    canvas.getAspectRatio()));
            }
        }
        return {
            canvas,
            mod2WidthDiff,
            mod2HeightDiff,
        };
    }

    private accurateHeightRecalc(useFloorHeightRecalc: boolean, targetAspectRatio: number, targetWidth: number) {
        const targetHeight = useFloorHeightRecalc ? Math.floor(targetWidth / targetAspectRatio)
            : Math.ceil(targetWidth / targetAspectRatio);

        return targetHeight;
    }

    private isNumberMod2(value: number) {
        return Math.round(value) % 2 === 0;
    }
}
