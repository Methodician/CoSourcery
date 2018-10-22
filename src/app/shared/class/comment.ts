export class Comment {
    constructor(
        public authorId?: string,
        public parentKey?: string,
        public text?: string,
        public lastUpdated?: number,
        public timestamp?: number,
    ) {
        this.text = text || '';
        this.lastUpdated = lastUpdated || new Date().getTime();
    }
}

//  Very cool: https://stackoverflow.com/questions/13315131/enforcing-the-type-of-the-indexed-members-of-a-typescript-object
export interface KeyMap<T> { [key: string]: T; };
export interface CommentMap extends KeyMap<Comment> { };