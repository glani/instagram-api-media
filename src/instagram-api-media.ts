// instagram-api-media

import {BaseOptions} from './BaseOptions';
import {InstagramPhoto} from './InstagramPhoto';
import {InstagramPhotoCalculator} from './InstagramPhotoCalculator';
import {PhotoDetails} from './MediaDetails';
import {CalculatedValue, OperationEnum} from './Types';

export const instagramApiMediaLib = {
    calculate(inputMedia: PhotoDetails, options?: BaseOptions): CalculatedValue {
        const instagramPhoto = new InstagramPhoto(inputMedia, {operation: OperationEnum.EXPAND});
        const instagramPhotoCalculator = new InstagramPhotoCalculator(instagramPhoto);
        return instagramPhotoCalculator.calculate();
    },
};
