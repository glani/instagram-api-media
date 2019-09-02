import 'jest';
import {DirectConstraints} from './Constraints';

describe('constraints test', () => {
    test('check constraint', () => {
        const constraint = new DirectConstraints()
        expect(constraint.getMinDuration()).toBe(1.0);
    });

});
