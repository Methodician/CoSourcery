import { Timestamp } from '../../../../node_modules/rxjs';

export class ArticleDetailOpen {
    constructor(
        public authorKey: string,
        public title: string,
        public bodyKey: string,
        public introduction: string,
        public lastUpdated: number,
        public timeStamp: number,
        public version: number,
        public tags?: string[]
    ) { }
}


export class ArticleDetailPreview {
    constructor(
        public previewId: string,
        public authorId: string,
        public title: string,
        public introduction: string,
        public lastUpdated: firebase.firestore.Timestamp,
        public timeStamp: firebase.firestore.Timestamp,
        public version: number,
        public commentCount: number,
        public viewCount: number,
        public tags?: string[],
        public imgUrl?: string,
        public imgAlt?: string
    ) { }
}


export class ArticleDetailFirestore {
    constructor(
        public authorId: string,
        public bodyId: string,
        public title: string,
        public introduction: string,
        public lastUpdated: firebase.firestore.Timestamp,
        public timestamp: firebase.firestore.Timestamp,
        public version: number,
        public commentCount: number,
        public viewCount: number,
        public tags?: string[],
        public body?: string,
        public articleId?: string,
        public isFeatured?: boolean,
        public lastEditorId?: string,
        public imgUrl?: string,
        public imgAlt?: string,
        public authorImgUrl?: string
    ) { }
}

export class ArticleBodyFirestore {
    constructor(
        public body: string
    ) { }
}

export class GlobalTag {
    constructor(
        public count: number,
        public timestamp: Date
    ) { }
}

export class ArticleEditorFirestore {
    constructor(
        public uid: string,
        public name: string,
        public timestamp: number
    ) { }
}
