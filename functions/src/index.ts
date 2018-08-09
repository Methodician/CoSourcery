import * as functions from 'firebase-functions';
import * as  admin from 'firebase-admin';
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
const fs = admin.firestore();

exports.createHistoryObject = functions.firestore.document('articleData/articles/articles/{articleId}').onWrite((change, context) => {
    if (context.eventType !== 'onDelete' ) {
        const articleObject = change.after.data();
        const historyId = articleObject.version;
        change.after.ref.collection('history').doc(historyId).set(articleObject).catch(error => {
            console.log(error);
            
        })
    }
});


exports.createPreviewObject = functions.firestore.document('articleData/articles/articles/{articleId}').onWrite((change, context) => {
    const articleObject = change.after.data();
    const id = context.params.articleId;
    const previewRef = fs.doc(`articleData/articles/previews/${id}`)
    const previewObject = {
        id: articleObject.uid,
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
    previewRef.set(previewObject).catch(error => {
        console.log(error);
    })   
});
