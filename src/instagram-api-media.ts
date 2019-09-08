// instagram-api-media

import {BaseOptions} from './BaseOptions';
import {InstagramPhoto} from './InstagramPhoto';
import {InstagramPhotoCalculator} from './InstagramPhotoCalculator';
import {InstagramVideo} from './InstagramVideo';
import {InstagramVideoCalculator} from './InstagramVideoCalculator';
import {PhotoDetails, VideoDetails} from './MediaDetails';
import {CalculatedValue, OperationEnum} from './Types';

export const instagramApiMediaLib = {
    calculatePhoto(inputMedia: PhotoDetails, options?: BaseOptions): CalculatedValue {
        const instagramPhoto = new InstagramPhoto(inputMedia, {operation: OperationEnum.EXPAND});
        const instagramPhotoCalculator = new InstagramPhotoCalculator(instagramPhoto);
        return instagramPhotoCalculator.calculate();
    },

    calculateVideo(inputMedia: VideoDetails, options?: BaseOptions): CalculatedValue {
        const instagramPhoto = new InstagramVideo(inputMedia, {operation: OperationEnum.EXPAND});
        const instagramPhotoCalculator = new InstagramVideoCalculator(instagramPhoto);
        return instagramPhotoCalculator.calculate();
    },
};
