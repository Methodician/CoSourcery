import { AuthService } from '../../../services/auth.service';
import { UploadService } from '../../../services/upload.service';
import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ArticleService } from '../../../services/article.service';
import { UserService } from '../../../services/user.service';
import { ArticleDetailFirestore } from 'app/shared/class/article-info';
import { UserInfoOpen } from 'app/shared/class/user-info';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';

import * as smoothscroll from 'smoothscroll-polyfill';

@Component({
  selector: 'cos-article-detail',
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.scss']
})
export class ArticleDetailComponent implements OnInit, OnChanges, OnDestroy {
  @Input() articleData: any;
  @Input() editingPreview = false;
  articleKey: string;
  // viewId = '';
  isArticleBookmarked: boolean;
  author;
  article;
  articleCoverImageUrl: string;
  // iFollow: any;
  // followsMe: any;
  profileImageUrl: string;
  user: UserInfoOpen = null;
  // viewIncremented = false;


  // kb
  // allArticles: any;
  // currentArticle = 0;
  // relatedArticles: any;

  // SWIPE_ACTION = { LEFT: 'swipeleft', RIGHT: 'swiperight' };

  constructor(
    private articleSvc: ArticleService,
    private userSvc: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private uploadSvc: UploadService,
    private authSvc: AuthService
  ) { smoothscroll.polyfill(); }

  ngOnInit() {
    window.scrollTo(0, 0);
      this.route.params.subscribe(params => {
        if (params['key']) {
          this.articleKey = params['key'];
        }
        // this.checkIfFeatured();
        // TODO: Refactor below(142);
        this.getArticleData();
      });
    this.userSvc.userInfo$.subscribe((user: UserInfoOpen) => {
      if (user.exists()) {
        this.user = user;
        this.checkIfBookmarked();
      }
    });
  }

  ngOnDestroy() {
    // if (this.viewId) {
    //   this.articleSvc.captureArticleUnView(this.articleKey, this.viewId);
    // }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['articleData'] && changes['articleData'].currentValue) {
      this.article = changes['articleData'].currentValue;
    }
    console.log('changes', this.article);
  }

  navigateToProfile() {
    this.articleSvc.navigateToProfile(this.author.uid);
  }

  async checkIfBookmarked() {
    const isBookmarked = await this.articleSvc.isBookmarked(this.user.uid, this.articleKey);
    this.isArticleBookmarked = isBookmarked;
  }

  bookmarkToggle() {
    if (this.authSvc.isSignedIn()) {
      if (this.isArticleBookmarked) {
        this.articleSvc.unBookmarkArticle(this.user.uid, this.article.articleId);
        this.isArticleBookmarked = false;
      } else {
        this.articleSvc.bookmarkArticle(this.user.uid, this.article.articleId);
        this.isArticleBookmarked = true;
      }
    }
  }


  edit() {
    this.router.navigate([`editarticle/${this.articleKey}`]);
  }

  // get hasHistory() {
  //   return this.articleData && this.articleData.version > 1;
  // }

  // navigateToHistory() {
  //   this.router.navigate([`articlehistory/${this.articleKey}`]);
  // }

  // toggleFeatured() {
  //   if (this.authSvc.isSignedIn()) {
  //     if (this.article.isFeatured) {
  //       this.articleSvc.unFeatureArticle(this.articleKey);
  //     } else {
  //       // kb: changed this
  //       this.articleSvc.featureArticle(this.articleKey, this.author.uid);
  //     }
  //   }
  // }

  async getArticleData() {
    const articleData = await this.articleSvc.getFullArticleById(this.articleKey);
    if (articleData) {
      const thisArticle = new ArticleDetailFirestore (
        articleData.authorId,
        articleData.bodyId,
        articleData.title,
        articleData.introduction,
        articleData.lastUpdated,
        articleData.timestamp,
        articleData.version,
        articleData.commentCount,
        articleData.viewCount,
        articleData.tags,
        articleData.body,
        articleData.imgUrl,
        articleData.imgAlt,
);
      thisArticle.articleId = this.articleKey;
      this.article = thisArticle;
      this.articleData = articleData;
      this.getAuthor(this.article.authorId);
      this.getProfileImage(this.article.authorId);
      // TEMP
      if (articleData.imgUrl) {
        console.log(articleData.imgUrl);
        this.articleCoverImageUrl = articleData.imgUrl;
      } else {
        this.getArticleCoverImage(this.articleKey);
      }
    }
  }

  // async testTimeStamp() {

  //   this.testTime =

  // }
  //  TODO: Refactor and Reimplement
  // getArticleData() {
  //   //  Firestore way:
  //   this.articleSvc
  //     .getArticleById(this.articleKey)
  //     .valueChanges()
  //     .subscribe(async (articleData: ArticleDetailFirestore) => {
  //       if (!this.viewIncremented && !this.editingPreview) {
  //         try {
  //           const id = await this.articleSvc.captureArticleView(this.articleKey, articleData.version, this.user);
  //           if (id) {
  //             this.viewId = id;
  //             this.viewIncremented = true;
  //           }
  //         } catch (err) {
  //           console.error(err);
  // }

  // this.articleSvc.captureArticleView(this.articleKey, articleData.version, this.user)
  //   .then(id => {
  //     if (id) {
  //       this.viewId = id;
  //       this.viewIncremented = true;
  //     }
  //   })
  //   .catch(err => {
  //     console.error(err);
  //   });

  // }
  //       if (articleData) {
  //         this.articleData = articleData;
  //         this.getArticleBody(articleData);
  //         this.getAuthor(articleData.authorId);
  //         this.getProfileImage(articleData.authorId);
  //         this.getArticleCoverImage(this.articleKey);
  //       }
  //     });
  // }

  async getArticleCoverImage(articleKey) {
    const basePath = 'uploads/articleCoverImages';
    const imageUrl = await this.uploadSvc.getImageUrl(articleKey, basePath);
    this.articleCoverImageUrl = imageUrl;
  }

  async getArticleBody(articleData: any) {
      const articleBody = await this.articleSvc.getArticleBody(articleData.bodyId);
      articleData.body = articleBody;
  }

  async getAuthor(authorKey: string) {
    const author = await this.articleSvc.getAuthor(authorKey);
    this.author = author;
  }

  // followClick() {
  //   if (this.authSvc.isSignedIn()) {
  //     this.userSvc.followUser(this.article.authorKey);
  //   }
  // }

  // tagSearch(tag: string) {
  //   this.router.navigate([`/articlesearch/${tag}`]);
  // }

  async getProfileImage(authorKey) {
    const basePath = 'uploads/profileImages/';
    const imageUrl = await this.uploadSvc.getImageUrl(authorKey, basePath);
    this.profileImageUrl = imageUrl;
  }

  // nextArticle() {
  //   if (this.currentArticle !== this.allArticles.length - 1) {
  //     this.currentArticle++;
  //   }
  // }
  // prevArticle() {
  //   if (this.currentArticle !== 0) {
  //     this.currentArticle--;
  //   }
  // }
  // positionWrapper(): string {
  //   return `${-320 * this.currentArticle}px`;
  // }

  // swipe(action = this.SWIPE_ACTION.RIGHT) {
  //   if (action === this.SWIPE_ACTION.RIGHT) {
  //     this.prevArticle();
  //   }
  //   if (action === this.SWIPE_ACTION.LEFT) {
  //     this.nextArticle();
  //   }
  // }

  // scroll(el: any) {
  //   // make smoother?
  //   el.scrollIntoView({ behavior: 'smooth' });
  // }
}


