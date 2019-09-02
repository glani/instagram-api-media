import {
    AlbumConstraints,
    ConstraintsInterface,
    DirectConstraints,
    DirectStoryConstraints,
    StoryConstraints, TimelineConstraints, TvConstraints} from './Constraints';
import {FeedTypeEnum} from './Types';

export class ConstraintsFactory {

    public static createFor(targetFeed: FeedTypeEnum): ConstraintsInterface {
        switch (targetFeed) {
            case FeedTypeEnum.FEED_STORY:
                return new StoryConstraints();

            case FeedTypeEnum.FEED_DIRECT:
                return new DirectConstraints();

            case FeedTypeEnum.FEED_DIRECT_STORY:
                return new DirectStoryConstraints();

            case FeedTypeEnum.FEED_TV:
                return new TvConstraints();

            case FeedTypeEnum.FEED_TIMELINE_ALBUM:
                return new AlbumConstraints();

            case FeedTypeEnum.FEED_TIMELINE:
            default:
                return new TimelineConstraints();
        }
    }
}
