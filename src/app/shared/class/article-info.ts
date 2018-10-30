// import * as firebase from 'firebase/app';
export class ArticleDetailPreview {
    constructor(
        public articleId: string,
        public authorId: string,
        public title: string,
        public introduction: string,
        public lastUpdated: any,
        public timeStamp: any,
        public imageUrl: string,
        public imageAlt: string,
        public version: number,
        public commentCount?: number,
        public viewCount?: number,
        public tags?: string[],
    ) { }
}


export class ArticleDetailFirestore {
    constructor(
        public articleId: string,
        public authorId: string,
        public title: string,
        public introduction: string,
        public body: string,
        public imageUrl: string,
        public imageAlt: string,
        public authorImageUrl: string,
        public lastUpdated: any,
        public timestamp: any,
        public lastEditorId: string,
        public version: number,
        public commentCount?: number,
        public viewCount?: number,
        public tags?: string[],
        public isFeatured?: boolean,
    ) { }
}
