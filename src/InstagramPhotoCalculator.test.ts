import 'jest';
import {InstagramPhoto} from './InstagramPhoto';
import {InstagramPhotoCalculator} from './InstagramPhotoCalculator';
import {PhotoDetails} from './MediaDetails';
import {ImageType, OperationEnum} from './Types';

describe('InstagramPhotoCalculator', () => {
    test('calculate expand', () => {
        const details = new PhotoDetails('/Screenshot from 2019-08-17 22-27-44.png', Math.ceil(32.2 * 1024), 1018, 272, ImageType.IMAGETYPE_PNG);
        const instagramPhoto = new InstagramPhoto(details, {operation: OperationEnum.EXPAND});
        const instagramPhotoCalculator = new InstagramPhotoCalculator(instagramPhoto);
        const value = instagramPhotoCalculator.calculate();
        expect(value.canvas.getWidth()).toBe(1018);
        expect(value.canvas.getHeight()).toBe(533);

        expect(value.dst.getY()).toBe(130);
        expect(value.dst.getHeight()).toBe(272);
    });

    test('calculate crop', () => {
        const details = new PhotoDetails('/Screenshot from 2019-08-17 22-27-44.png', Math.ceil(32.2 * 1024), 1018, 272, ImageType.IMAGETYPE_PNG);
        const instagramPhoto = new InstagramPhoto(details, {operation: OperationEnum.CROP});
        const instagramPhotoCalculator = new InstagramPhotoCalculator(instagramPhoto);
        const value = instagramPhotoCalculator.calculate();
        expect(value.canvas.getWidth()).toBe(519);
        expect(value.canvas.getHeight()).toBe(272);

        expect(value.src.getX()).toBe(249);
        expect(value.src.getY()).toBe(0);

        expect(value.src.getWidth()).toBe(519);
        expect(value.src.getHeight()).toBe(272);

        expect(value.dst.getWidth()).toBe(519);
        expect(value.dst.getHeight()).toBe(272);
    });
});
