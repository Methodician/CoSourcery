"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
admin.initializeApp();
const fs = admin.firestore();
exports.createHistoryObject = functions.firestore.document('articleData/articles/articles/{articleId}').onWrite((change, context) => {
    if (context.eventType !== 'google.firestore.document.delete') {
        console.log('eventType', context.eventType);
        const articleId = context.params.articleId;
        const articleObject = change.after.data();
        const historyId = articleObject.version;
        const historyRef = fs.doc(`articleData/articles/articles/${articleId}/history/${historyId}`);
        return historyRef.set(articleObject).catch(error => {
            console.log(error);
        });
    }
    else {
        return null;
    }
});
exports.createEditorObject = functions.firestore.document('articleData/articles/articles/{articleId}').onWrite((change, context) => {
    if (context.eventType !== 'google.firestore.document.delete') {
        // console.log('eventType', context.eventType);
        const articleId = context.params.articleId;
        const articleData = change.after.data();
        const authorId = articleData.authorId;
        const editorObject = { editorID: articleData.authorId };
        const editorRef = fs.doc(`articleData/articles/articles/${articleId}/editors/${authorId}`);
        return editorRef.set(editorObject).catch(error => {
            console.log(error);
        });
    }
    else {
        return null;
    }
});
exports.createPreviewObject = functions.firestore.document('articleData/articles/articles/{articleId}').onWrite((change, context) => {
    const articleObject = change.after.data();
    const id = context.params.articleId;
    const previewRef = fs.doc(`articleData/articles/previews/${id}`);
    const previewObject = {
        id: articleObject.articleId,
        authorId: articleObject.authorId,
        title: articleObject.title,
        introduction: articleObject.introduction,
        lastUpdated: articleObject.lastUpdated,
        timestamp: articleObject.timestamp,
        version: articleObject.version,
        commentCount: articleObject.commentCount,
        viewCount: articleObject.viewCount,
        tags: articleObject.tags,
        imageUrl: articleObject.imageUrl,
        imageAlt: articleObject.imageAlt
    };
    console.log(previewObject);
    return previewRef.set(previewObject).catch(error => {
        console.log(error);
    });
});
//# sourceMappingURL=index.js.map