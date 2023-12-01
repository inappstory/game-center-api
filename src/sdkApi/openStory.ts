import {closeGameReader as sdkCloseGameReader} from './index';
import {OpenStoryOptions} from "./openStory.h";

export const openStory = (openStory: OpenStoryOptions) => {
    sdkCloseGameReader({openStory});
};
