export class Comment {
    constructor(
        public authorId?: string,
        public parentKey?: string,
        public lastUpdated?: number,
        public timestamp?: number,
        public text?: string,
    ) {
        this.text = text || '';
        this.lastUpdated = lastUpdated || new Date().getTime();
    }
}
