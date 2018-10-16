
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as path from 'path';
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
admin.initializeApp();
const fs = admin.firestore();
// const storage = admin.storage();


// Subroutines of trackFileUploads:
const trackArticleBodyImages = async (filePath: string, articeleId: string) => {
    const articleDocRef = fs.doc(`articleData/articles/articles/${articeleId}`);
    const snapshot = await articleDocRef.get();
    const article = snapshot.data();
    const fileName = path.basename(filePath);
    console.log('the file name is', fileName);
    
    console.log('The image belongs to:');
    console.log(article);
    const tags = article.tags;
    console.log('tags', tags);
    const arrayUnuion = await articleDocRef.update({
    })
}

//  trackUploadFiles entry point:
exports.trackFileUploads = functions.storage.object().onFinalize(async object => {
    const contentType = object.contentType;
    const filePath = object.name;
    console.log('cententType', contentType);
    console.log('filePath', filePath);
    if(contentType.startsWith('image/')){
        //  An image was uploaded.
        if(filePath.startsWith('articleBodyImages/')){
            //  It was a body image.
            console.log('It was a body image');
            //  The string 'articleCoverImages/' contains 18 characters.
            //  Firestore push IDs contain 20 characters.
            const articleId = filePath.substr(18, 20);
            console.log('The article ID is', articleId);
            await trackArticleBodyImages(filePath, articleId);
            //  Don't do anything else. Exit function just in case.
            return null;
        }
        if(filePath.startsWith('articleCoverImages/')){
            //  It was a cover image.
            console.log('It was a cover image');
        }
        //  We don't know what kind of image it was. Maybe do something? For now, exit function.
        return null;
    }
    //  We're not doing anything, exit function.
    return null;
});


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
});

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
});

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
            imageUrl: articleObject.imageUrl,
            imageAlt: articleObject.imageAlt
        }    
        return previewRef.set(previewObject).catch(error => {
            console.log(error);
        })
    } else {
        return null;
    }
});
