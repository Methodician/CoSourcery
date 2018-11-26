'use strict';

import * as functions from 'firebase-functions';

import * as admin from 'firebase-admin';
admin.initializeApp();
const adminFS = admin.firestore();
const adminDB = admin.database();
adminFS.settings({ timestampsInSnapshots: true });

import * as algoliasearch from 'algoliasearch';
const client = algoliasearch(functions.config().algolia.app_id, functions.config().algolia.admin_key);

// const { Storage } = require('@google-cloud/storage');
import { Storage } from '@google-cloud/storage';
const gcs = new Storage();

import * as cpp from 'child-process-promise';
const spawn = cpp.spawn;

import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

import { Comment, ParentTypes } from '../../src/app/shared/class/comment';
import { ArticleDetail, ArticlePreview } from '../../src/app/shared/class/article-info';
// WATCH OUT - Currently, can't figure out way to build for prod, so need to swap these when deploying to production server...
import { environment } from '../../src/environments/environment';
// import { environment } from '../../src/environments/environment.prod';


//  Should we consolodate any simple ArticleDetail OnUpdate responses under this trigger?
const trackArticleEditors = (article) => {
    const editorId = article.lastEditorId;
    const articleId = article.articleId;
    const updatedAt = new Date(article.lastUpdated.toDate()).getTime();
    const ref = adminDB.ref(`userInfo/articlesEditedPerUser/${editorId}/${articleId}/${updatedAt}`);
    return ref.set(true);
}
exports.onUpdateArticleDetail = functions.firestore.document('articleData/articles/articles/{articleId}').onUpdate(async (change, context) => {
    const article = change.after.data();
    try {
        await trackArticleEditors(article);
        console.log('tracked article editing');
    } catch (error) {
        console.log('can\'t track editing', error);
    }
    return null;
});

//  Should we consolodate any simple ArticleDetail OnCreate responses under this trigger?
const trackArticleAuthorship = (article) => {
    const authorId = article.authorId;
    const articleId = article.articleId;
    const createdAt = new Date(article.timestamp.toDate()).getTime();
    const ref = adminDB.ref(`userInfo/articlesAuthoredPerUser/${authorId}/${articleId}`);
    return ref.set(createdAt);
}
exports.onCreateArticleDetail = functions.firestore.document('articleData/articles/articles/{articleId}').onCreate(async (snap, context) => {
    const article = snap.data();
    try {
        await trackArticleAuthorship(article);
        console.log('tracked article authorship');
    } catch (error) {
        console.log('can\'t track authorship', error);
    }
    return null;
});

//  Should we consolodate any simple ArticleDetail OnWrite responses under this trigger?
// exports.onCreateArticleDetail = functions.firestore.document('articleData/articles/articles/{articleId}').onWrite()


exports.updateAlgoliaIndex =
    functions.firestore.document('articleData/articles/articles/{articleId}').onWrite((change, context) => {
        const articleObject = change.after.data();
        const index = client.initIndex(environment.algoliaIndex);
        if (context.eventType !== 'google.firestore.document.delete') {
            const previewObject = {
                objectID: articleObject.articleId,
                title: articleObject.title,
                introduction: articleObject.introduction,
                body: articleObject.body,
                tags: articleObject.tags
            }
            return index.saveObject(previewObject);
        } else {
            return index.deleteObject(articleObject.articleId);
        }
    });

exports.trackCommentVotes = functions.database.ref(`commentData/votesByUser/{userId}/{commentKey}`).onWrite(async (change, context) => {

    const before = change.before.val();
    const after = change.after.val();
    // null = 0
    const diff = after - before;
    const commentKey = context.params['commentKey'];
    const commentRef = adminDB.ref(`commentData/comments/${commentKey}`);
    return commentRef.transaction((commmentToUpdate: Comment) => {
        if (!commmentToUpdate) {
            return null;
        }
        const oldCount = commmentToUpdate.voteCount || 0;
        const newCount = oldCount + diff;
        commmentToUpdate.voteCount = newCount;
        return commmentToUpdate;
    });
});

exports.trackCommentDeletions = functions.database.ref('commentData/comments/{commentKey}/removedAt').onCreate(async (snap, context) => {
    const commentRef = snap.ref.parent;
    const archiveRef = snap.ref.parent.parent.parent.child('commentArchive');
    const commentSnap = await commentRef.once('value').then();
    return Promise.all([
        archiveRef.set(commentSnap.val()),
        commentRef.update({ text: 'This comment was removed.' })
    ]);
})

exports.bubbleUpCommentCount = functions.database.ref('commentData/comments/{commentKey}/replyCount').onUpdate(async (change, context) => {

    const incrementReplyCount = (commentRef: admin.database.Reference) => {
        return commentRef.transaction((commentToUpdate: Comment) => {
            if (commentToUpdate) {
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
        return adminFS.runTransaction(async t => {
            const snapshot = await t.get(articleDocRef);
            const article: ArticleDetail = snapshot.data() as any;
            let commentCount = article.commentCount || 0;
            commentCount = commentCount + 1;
            t.update(articleDocRef, { commentCount: commentCount });
        }).then(res => {
            console.log('Transaction success!');
        }).catch(err => {
            console.log('Transaction failure:', err);
        });
    };

    const parentCommentRef = adminDB.ref(`commentData/comments/${context.params.commentKey}`);
    const snap = await parentCommentRef.once('value').then();
    const comment = snap.val()
    if (comment.parentType === ParentTypes.article) {
        const articleRef = adminFS.doc(`articleData/articles/articles/${comment.parentKey}`);
        return incrementCommentCount(articleRef);
    } else if (comment.parentType === ParentTypes.comment) {
        const ref = adminDB.ref(`commentData/comments/${comment.parentKey}`);
        return incrementReplyCount(ref);
    }

    console.log('About to return null. Comments may not be counted...');
    return null;
});

exports.countNewComment = functions.database.ref('commentData/comments/{commentKey}').onCreate(async (snap, context) => {

    const incrementReplyCount = (commentRef: admin.database.Reference) => {
        return commentRef.transaction((commentToUpdate: Comment) => {
            if (commentToUpdate) {
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
        return adminFS.runTransaction(async t => {
            const snapshot = await t.get(articleDocRef);
            const article: ArticleDetail = snapshot.data() as any;
            let commentCount = article.commentCount || 0;
            commentCount = commentCount + 1;
            t.update(articleDocRef, { commentCount: commentCount });
        }).then(res => {
            console.log('Transaction success!');
        }).catch(err => {
            console.log('Transaction failure:', err);
        });
    };

    const comment: Comment = snap.val();
    if (comment.parentType === ParentTypes.article) {
        const articleRef = adminFS.doc(`articleData/articles/articles/${comment.parentKey}`);
        return incrementCommentCount(articleRef);
    } else if (comment.parentType === ParentTypes.comment) {
        const commentRef = adminDB.ref(`commentData/comments/${comment.parentKey}`);
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
        }
        if (filePath.startsWith('articleCoverImages/')) {
            //  It was a cover image.
            await createCoverImageThumbnail(object);
        }
    }
    //  Whether or not we did something, exit funciton
    return null;
});

// Subroutines of trackFileUploads:
async function trackArticleBodyImages(filePath: string) {
    //  The string 'articleCoverImages/' contains 18 characters.
    //  Firestore push IDs contain 20 characters.
    const articleId = filePath.substr(18, 20);
    const articleDocRef = adminFS.doc(`articleData/articles/articles/${articleId}`);
    await articleDocRef.update({
        bodyImagePaths: admin.firestore.FieldValue.arrayUnion(filePath)
    });
}

async function createCoverImageThumbnail(object: functions.storage.ObjectMetadata) {
    console.log('creating cover image thumbnail');
    // looks like cover images on preview card ranges from 260x175 to 360x175 - let's go with a standard 260x175px thumbnail
    const fileBucket = object.bucket;
    const filePath = object.name;
    const contentType = object.contentType;

    // fileName should be an articleId...
    const fileName = path.basename(filePath);
    const bucket = gcs.bucket(fileBucket);
    const tempFilePath = path.join(os.tmpdir(), fileName);
    const metadata = { contentType: contentType };
    await bucket.file(filePath).download({
        destination: tempFilePath,
    })
    await spawn('convert', [tempFilePath, '-thumbnail', '260x175>', tempFilePath]);
    const thumbFilePath = path.join('articleCoverThumbnails', fileName);
    // upload the thumbnail
    await bucket.upload(tempFilePath, {
        destination: thumbFilePath,
        metadata: metadata
    });

    // delete the local file to free up space
    fs.unlinkSync(tempFilePath);
    return null;
}


// The following which respond to onWrite of an article could be combined.
exports.createHistoryObject = functions.firestore.document('articleData/articles/articles/{articleId}').onWrite((change, context) => {
    if (context.eventType !== 'google.firestore.document.delete') {
        const articleId = context.params.articleId;
        const articleObject = change.after.data();
        const historyId = articleObject.version;
        const historyRef = adminFS.doc(`articleData/articles/articles/${articleId}/history/${historyId}`);
        return historyRef.set(articleObject).catch(error => {
            console.log(error);
        })
    } else {
        return null;
    }
});

exports.createPreviewObject = functions.firestore.document('articleData/articles/articles/{articleId}').onWrite((change, context) => {
    const articleObject = change.after.data();
    const id = context.params.articleId;
    const previewRef = adminFS.doc(`articleData/articles/previews/${id}`);
    if (context.eventType !== 'google.firestore.document.delete') {
        const previewObject = previewFromArticle(articleObject);
        return previewRef.set(previewObject).catch(error => {
            console.log(error);
        })
    } else {
        return null;
    }
});

function previewFromArticle(articleObject) {
    const { articleId, authorId, title, introduction, lastUpdated, timestamp, version, editors, commentCount, viewCount, tags, imageUrl, imageAlt } = articleObject;
    const url = imageUrl && imageUrl.length > 0 ? 'unset' : '';
    return new ArticlePreview(articleId, authorId, title, introduction, url, imageAlt, lastUpdated, timestamp, version, editors, commentCount, viewCount, tags);
}

