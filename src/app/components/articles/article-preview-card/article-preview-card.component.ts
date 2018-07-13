import { Component, OnInit, Input } from '@angular/core';
import { UploadService } from '../../../services/upload.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ArticleService } from '../../../services/article.service';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { ArticleDetailFirestore } from 'app/shared/class/article-info';
@Component({
  selector: 'cos-article-preview-card',
  templateUrl: './article-preview-card.component.html',
  styleUrls: ['./article-preview-card.component.scss']
})
export class ArticlePreviewCardComponent implements OnInit {
  @Input() articleData: ArticleDetailFirestore;
  author;
  profileImageUrl;
  articleCoverImageUrl;
  user;
  isArticleBookmarked: boolean;
  hoverClass: string;
  hoverBg: string;
  constructor(
    private articleSvc: ArticleService,
    private router: Router,
    private uploadSvc: UploadService,
    private userSvc: UserService,
    private authSvc: AuthService
  ) { }

  ngOnInit() {
    this.author = this.articleSvc
    .getAuthor(this.articleData.authorId);
        if (this.author.$key) {
          this.getProfileImage(this.author.$key);
        }
        this.author = this.articleSvc
        .getAuthor(this.articleData.authorId);


    this.userSvc
      .userInfo$
      .subscribe(user => {
        if (user.exists()) {
          this.user = user;
          this.checkIfBookmarked();
        }
      });
    this.getArticleCoverImage(this.articleData.articleId);

  }


//   async getArticleData() {
//     const articleData = await this.articleSvc.getFullArticleById(this.articleKey);
//     if (articleData) {
//       const thisArticle = new ArticleDetailFirestore (
//         articleData.authorId,
//         articleData.bodyId,
//         articleData.title,
//         articleData.introduction,
//         this.articleSvc.getArticleUpdateTime(this.articleKey),
//         this.articleSvc.getArticleTimeStampTime(this.articleKey),
//         articleData.version,
//         articleData.commentCount,
//         articleData.viewCount,
//         articleData.tags,
//         articleData.body,
// )
//       thisArticle.articleId = this.articleKey;
//       this.article = thisArticle;
//       this.articleData = articleData;
//       this.getAuthor(this.article.authorId);
//       this.getProfileImage(this.article.authorId);
//       this.getArticleCoverImage(this.articleKey);
//     }
//   }


  navigateToArticleDetail() {
    window.scrollTo(0, 0);
    this.articleSvc.navigateToArticleDetail(this.articleData.articleId);
  }

  navigateToProfile() {
    this.articleSvc.navigateToProfile(this.articleData.authorId);
  }

  getProfileImage(uid) {
    const basePath = 'uploads/profileImages/';
    this.profileImageUrl = this.uploadSvc.
     getImageUrl(uid, basePath);
  }

  async getArticleCoverImage(articleKey) {
    const basePath = 'uploads/articleCoverImages';
    this.articleCoverImageUrl = await this.uploadSvc
      .getImageUrl(articleKey, basePath);
  }
  
  async checkIfBookmarked() {
    this.isArticleBookmarked = await this.articleSvc.isBookmarked(this.user.$key, this.articleData.articleId);
    
  }

  bookmarkToggle() {    
        if (this.authSvc.isSignedIn()) {
          if (this.isArticleBookmarked) {
            this.articleSvc.unBookmarkArticle(this.user.$key, this.articleData.articleId);
            this.isArticleBookmarked = false;
          } else {
            this.articleSvc.bookmarkArticle(this.user.$key, this.articleData.articleId);
            this.isArticleBookmarked = true;
          }
        }
      }

  hoverArticleCard() {
    this.hoverClass = this.hoverClass === '' ? 'hover-bg' : '';
    this.hoverBg = this.hoverBg === '' ? 'rgba(0,184,212, 0.15)'   : '';
  }

  exitCard() {
    this.hoverClass = '';
    this.hoverBg = '';
  }

  enterCard() {
    this.hoverClass = 'hover-bg';
    this.hoverBg = 'rgba(0,184,212, 0.15)';
  }

}
