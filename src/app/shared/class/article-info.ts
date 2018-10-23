
export class ArticleDetailPreview {
    constructor(
        public previewId: string,
        public authorId: string,
        public title: string,
        public introduction: string,
        public lastUpdated: firebase.firestore.Timestamp,
        public timeStamp: firebase.firestore.Timestamp,
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
        public lastUpdated: firebase.firestore.Timestamp,
        public timestamp: firebase.firestore.Timestamp,
        public lastEditorId: string,
        public version: number,
        public commentCount?: number,
        public viewCount?: number,
        public tags?: string[],
        public isFeatured?: boolean,
    ) { }
}
