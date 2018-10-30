'use strict';

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Comment, ParentTypes } from '../../src/app/shared/class/comment';
import { ArticleDetailFirestore } from '../../src/app/shared/class/article-info';


admin.initializeApp();
const fs = admin.firestore();
const db = admin.database();
fs.settings({ timestampsInSnapshots: true });

exports.trackCommentDeletions = functions.database.ref('commentData/comments/{commentKey}/removedAt').onCreate(async (snap, context) => {
    const commentRef = snap.ref.parent;
    const archiveRef = snap.ref.parent.parent.parent.child('commentArchive');
    const commentSnap = await commentRef.once('value').then();
    return Promise.all([
        archiveRef.set(commentSnap.val()),
        commentRef.update({ text: 'This comment was removed.' })
    ]);
})

exports.bubbleUpCommentCount = functions.database.ref('commentData/comments/{commentKey}/replyCount').onUpdate(async(change, context) => {
    
    const incrementReplyCount = (commentRef: admin.database.Reference) => {
        return commentRef.transaction((commentToUpdate: Comment) => {
            if(commentToUpdate) {
                let replyCount = commentToUpdate.replyCount || 0;
                replyCount = replyCount + 1;
                commentToUpdate.replyCount = replyCount;
            }
            return commentToUpdate;
        })
        .then(_ => {
            console.log('db transaction success!');
        })
        .catch(err => {
            console.log('db transaction failure...', err);
        });
    };

    const incrementCommentCount = (articleDocRef: admin.firestore.DocumentReference) => {
        return fs.runTransaction(async t => {
            const snapshot = await t.get(articleDocRef);
            const article: ArticleDetailFirestore = snapshot.data() as any;
            let commentCount = article.commentCount || 0;
            commentCount = commentCount + 1;
            t.update(articleDocRef, {commentCount: commentCount});
        }).then(res => {
            console.log('Transaction success!');
        }).catch(err => {
            console.log('Transaction failure:', err);
        });
    };

    const parentCommentRef = db.ref(`commentData/comments/${context.params.commentKey}`);
    const snap = await parentCommentRef.once('value').then();
    const comment = snap.val()
    if(comment.parentType === ParentTypes.article){
        const articleRef = fs.doc(`articleData/articles/articles/${comment.parentKey}`);
        return incrementCommentCount(articleRef);
    } else if(comment.parentType === ParentTypes.comment){
        const ref = db.ref(`commentData/comments/${comment.parentKey}`);
        return incrementReplyCount(ref);
    }

    console.log('About to return null. Comments may not be counted...');
    return null;
});

exports.countNewComment = functions.database.ref('commentData/comments/{commentKey}').onCreate(async (snap, context) => {
    
    const incrementReplyCount = (commentRef: admin.database.Reference) => {
        return commentRef.transaction((commentToUpdate: Comment) => {
            if(commentToUpdate) {
                let replyCount = commentToUpdate.replyCount || 0;
                replyCount = replyCount + 1;
                commentToUpdate.replyCount = replyCount;
            }
            return commentToUpdate;
        })
        .then(_ => {
            console.log('db transaction success!');
        })
        .catch(err => {
            console.log('db transaction failure...', err);
        });
    };

    const incrementCommentCount = (articleDocRef: admin.firestore.DocumentReference) => {
        return fs.runTransaction(async t => {
            const snapshot = await t.get(articleDocRef);
            const article: ArticleDetailFirestore = snapshot.data() as any;
            let commentCount = article.commentCount || 0;
            commentCount = commentCount + 1;
            t.update(articleDocRef, {commentCount: commentCount});
        }).then(res => {
            console.log('Transaction success!');
        }).catch(err => {
            console.log('Transaction failure:', err);
        });
    };

    const comment: Comment = snap.val();
    if(comment.parentType === ParentTypes.article){
        const articleRef = fs.doc(`articleData/articles/articles/${comment.parentKey}`);
        return incrementCommentCount(articleRef);
    } else if(comment.parentType === ParentTypes.comment){
        const commentRef = db.ref(`commentData/comments/${comment.parentKey}`);
        return incrementReplyCount(commentRef);
    }
    console.log('About to return null. Comments may not be counted...');
    return null;
});

exports.trackCommentAuthorsAndParents = functions.database.ref('commentData/comments/{commentKey}').onCreate((snap, context) => {
    const comment: Comment = snap.val();
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
    await articleDocRef.update({
        bodyImagePaths: admin.firestore.FieldValue.arrayUnion(filePath)
    });
}

// The following which respond to onWrite of an article could be combined.
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
            articleId: articleObject.articleId,
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
