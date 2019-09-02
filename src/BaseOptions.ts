import {CropFocus, FeedTypeEnum, OperationEnum, SimpleColor} from './Types';

export interface BaseOptions {
    targetFeed?: FeedTypeEnum;
    operation?: OperationEnum;
    horCropFocus?: CropFocus;
    verCropFocus?: CropFocus;
    minAspectRatio?: number;
    maxAspectRatio?: number;
    userForceTargetAspectRatio?: number;
    useRecommendedRatio?: boolean;
    allowNewAspectDeviation?: boolean;
    bgColor?: SimpleColor;
    blurredBorder?: boolean;
}
