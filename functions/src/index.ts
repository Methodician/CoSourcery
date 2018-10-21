'use strict';

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';


admin.initializeApp();
const fs = admin.firestore();
fs.settings({ timestampsInSnapshots: true });

//  Can work from this example to write funciton to count comments and bubble up?
//  https://github.com/firebase/functions-samples/blob/master/limit-children/functions/index.js

exports.trackCommentDeletions = functions.database.ref('commentData/comments/{commentId}/removedAt').onCreate(async (snap, context) => {
    const commentRef = snap.ref.parent;
    const archiveRef = snap.ref.parent.parent.parent.child('commentArchive');
    const commentSnap = await commentRef.once('value').then();
    return Promise.all([
        archiveRef.set(commentSnap.val()),
        commentRef.update({ text: 'This comment was removed.' })
    ]);
})

exports.trackCommentAuthorsAndParents = functions.database.ref('commentData/comments/{commentKey}').onCreate((snap, context) => {
    const comment = snap.val();
    const key = context.params.commentKey;
    const commentRef = snap.ref;
    return Promise.all([
        commentRef.parent.parent.child(`commentsByParent/${comment.parentKey}/${key}`).set(true),
        commentRef.parent.parent.child(`commentsByAuthor/${comment.authorId}/${key}`).set(true)
    ]);
});

//  trackUploadFiles entry point:
exports.trackFileUploads = functions.storage.object().onFinalize(async object => {
    const contentType = object.contentType;
    const filePath = object.name;

    if (contentType.startsWith('image/')) {
        //  An image was uploaded.
        if (filePath.startsWith('articleBodyImages/')) {
            //  It was a body image.
            await trackArticleBodyImages(filePath);
            //  Don't do anything else. Exit function just in case.
            return null;
        }
        if (filePath.startsWith('articleCoverImages/')) {
            //  It was a cover image.
            console.log('It was a cover image');
        }
        //  We don't know what kind of image it was. Maybe do something? For now, exit function.
        return null;
    }
    //  We're not doing anything, exit function.
    return null;
});

// Subroutines of trackFileUploads:
async function trackArticleBodyImages(filePath: string) {
    //  The string 'articleCoverImages/' contains 18 characters.
    //  Firestore push IDs contain 20 characters.
    const articleId = filePath.substr(18, 20);
    const articleDocRef = fs.doc(`articleData/articles/articles/${articleId}`);
    // const snapshot = await articleDocRef.get();
    // const article = snapshot.data();
    // const fileName = path.basename(filePath);
    await articleDocRef.update({
        bodyImagePaths: admin.firestore.FieldValue.arrayUnion(filePath)
    });
}

//  Worked in a sense but ends up nesting deeper due to dot notation in file names. Going for simple arrays.
// function bodyImageUpdateObject(name, filePath) {
//     const obj = {};
//     const key = 'bodyImages.' + name;
//     obj[key] = filePath;
//     return obj
// }

exports.createHistoryObject = functions.firestore.document('articleData/articles/articles/{articleId}').onWrite((change, context) => {
    if (context.eventType !== 'google.firestore.document.delete') {
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
    if (context.eventType !== 'google.firestore.document.delete') {
        const articleId = context.params.articleId;
        const articleData = change.after.data()
        const authorId = articleData.authorId
        const editorObject = { editorID: articleData.authorId };
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
    if (context.eventType !== 'google.firestore.document.delete') {
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
