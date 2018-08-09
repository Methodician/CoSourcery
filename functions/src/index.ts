
import * as functions from 'firebase-functions';
import * as  admin from 'firebase-admin';
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
admin.initializeApp();
const fs = admin.firestore();


exports.createHistoryObject = functions.firestore.document('articleData/articles/articles/{articleId}').onWrite((change, context) => {
    if (context.eventType !== 'google.firestore.document.delete' ) {
        const articleId = context.params.articleId;
        const articleObject = change.after.data();
        const historyId = articleObject.version;
        const historyRef = fs.doc(`articleData/articles/articles/${articleId}/history/${historyId}`);
        return historyRef.set(articleObject).catch(error => {
            console.log(error);      
        })
    } else {
        return null;
    }
})

exports.createEditorObject = functions.firestore.document('articleData/articles/articles/{articleId}').onWrite((change, context) => {
    if (context.eventType !== 'google.firestore.document.delete' ) {
        const articleId = context.params.articleId;
        const articleData = change.after.data()
        const authorId = articleData.authorId
        const editorObject = {editorID: articleData.authorId};
        const editorRef = fs.doc(`articleData/articles/articles/${articleId}/editors/${authorId}`)
        return editorRef.set(editorObject).catch(error => {
            console.log(error);
        })
    } else {
        return null;
    }
})

exports.createPreviewObject = functions.firestore.document('articleData/articles/articles/{articleId}').onWrite((change, context) => {
    const articleObject = change.after.data();
    const id = context.params.articleId;
    const previewRef = fs.doc(`articleData/articles/previews/${id}`);
    if (context.eventType !== 'google.firestore.document.delete' ){
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
            imgUrl: articleObject.imgUrl,
            imgAlt: articleObject.imgAlt
        }    
        return previewRef.set(previewObject).catch(error => {
            console.log(error);
        })
    } else {
        return null;
    }
});
