import { UserInfoOpen } from "./user-info";

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
