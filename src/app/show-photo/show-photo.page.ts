import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AlertController, NavController  } from '@ionic/angular';
import { UserDataService } from './../user-data.service';
import { DataServiceService } from './../data-service.service';
import { TranslateService } from '@ngx-translate/core';
import { PopTools } from './../pop-tools';
import { PopRoutes } from './../pop-routes';

@Component({
  selector: 'app-show-photo',
  templateUrl: './show-photo.page.html',
  styleUrls: ['./show-photo.page.scss'],
})
export class ShowPhotoPage implements OnInit {
  ObjJson = {};
  ObjComments = [];
  resourceType = 1;
  objLabel = "";
  title = "";
  parentCaller = "";
  lngLikes = 0;
  lngNLikes = 0;
  lngComments = 0;
  infiniteScroll: any;
  lastComment: any;
  errorMessage: string;  
  sheetLabels: any = {};

  constructor(private router: Router, private alertCtrl: AlertController, private navCtrl: NavController, private UserData: UserDataService, 
      private rest: DataServiceService, private translate: TranslateService, private popTools: PopTools, private popRoutes: PopRoutes) { }

  ngOnInit() {
    this.translate.stream(['All_Like','All_DontLike','All_BTN_Cancel','Message_Send','Social_CommentAdd','Social_Comment',
			'Social_LikeSet','errManInvalidAccess','Social_AlreadyLiked','All_Item_Not_Found','All_AccessDenied',
			'Al_SystemError','All_CannotContinue','Social_NewCommentSuc','Social_CommentMissin','Social_Member_Portal',
			'All_Photo','All_Video','All_AddDocument','All_Product','All_Group','All_Object_Like','Group_News']).subscribe(res => {
      this.sheetLabels = res;
    });

  }

  ionViewDidEnter() {
    this.showResource(null);
  }
  
  goBack() {
    this.popRoutes.navigateBackwards();
  }

  showResource(resource) {
    this.ObjComments = [];
    this.title = this.sheetLabels["All_Photo"];
    this.ObjJson = this.popRoutes.getCurrentParam();
    
    if (this.ObjJson["parent"]) {this.parentCaller = this.ObjJson["parent"];}
    if (this.ObjJson["resourceType"]) {this.resourceType = this.ObjJson["resourceType"];}
    if (this.ObjJson["objLabel"]) {this.objLabel = this.ObjJson["objLabel"];}
    if (this.ObjJson["ShowComments"]) {
      if (this.ObjJson["ObjectType"] && this.ObjJson["ObjectID"]) {
        switch(this.ObjJson["ObjectType"]) {
	        case "member":
	          this.objLabel = this.sheetLabels["Social_Member_Portal"];
	          break;
	        case "picture":
	        case "grouppicture":
	          this.objLabel = this.sheetLabels["All_Photo"];
	          break;
	        case "video":
	        case "groupvideo":
	          this.objLabel = this.sheetLabels["All_Video"];
	          break;
	        case "document":
	        case "groupdocument":
	          this.objLabel = this.sheetLabels["All_AddDocument"];
	          break;
	        case "product":
	          this.objLabel = this.sheetLabels["All_Product"];
	          break;
	        case "group":
	          this.objLabel = this.sheetLabels["All_Group"];
	          break;
	        case "post":
	          this.objLabel = this.sheetLabels["Social_Comment"];
	          break;
	        case "grouppost":
	          this.objLabel = this.sheetLabels["Group_News"];
	          break;
	        default:
	          this.objLabel = this.sheetLabels["All_Photo"];
        }
  
	      this.title = this.objLabel;
	      this.getComments();
      }
    } else if (this.resourceType == 2) {
      this.title = this.sheetLabels["All_Video"];
    }
  }

  ionViewWillLeave() {
    var callback = this.ObjJson["pageClosed"];

    if (typeof callback =='function')
         callback({"Likes":this.lngLikes, "NLikes":this.lngNLikes, "Comments":this.lngComments});
  }

  getComments() {
    this.rest.getComments(this.ObjJson["ObjectType"], this.ObjJson["ObjectID"], null, null)
      .subscribe(
        comments => this.parsComments(comments),
        error =>  this.errorNotification(error));
  }
  
  parsComments(comments) {
    comments.forEach(comment => {
	    this.lastComment = comment.DateAdded;
      this.ObjComments.push(comment);
    });
  }

   async showAddCommentPrompt() {
      let inputs = [
        {
          name: 'comment',
          type: 'text',
          placeholder: this.sheetLabels["Social_Comment"]
        },
      ];
      let buttons = [
        {
          text: this.sheetLabels["Message_Send"],
          handler: (data) => {
            this.sendAddComment(data.comment);
          }
        }, {
          text: this.sheetLabels["All_BTN_Cancel"],
          role: 'cancel',
          handler: (blah) => {
            console.log('Cancel clicked');
          }
        }
      ];
    this.popTools.showAlertList(this.sheetLabels["Social_CommentAdd"], null, inputs, buttons);
  }
  
  sendAddComment(comment) {
    this.popTools.showLoading();
    this.rest.postComment(this.ObjJson["ObjectType"], this.ObjJson["ObjectID"], comment)
      .subscribe(
        response => this.parsCommentResponse(response, comment),
        error =>  this.parsPostError(error));
  }

  parsCommentResponse(response, comment) {
    var TimeStamp = new Date();

    if (response.rowsAffected[0]) {
      var objComment = {"ID":0, "UserID":this.UserData.currentUser.user_id, "ObjectType":this.ObjJson["ObjectType"], "ObjectID":this.ObjJson["ObjectID"], "Comment":comment, "DateAdded":TimeStamp, "FullName":this.UserData.userFullname, "PhotoLocation":this.UserData.userPhoto, "LastActive":TimeStamp};
      this.ObjComments.unshift(objComment);
      this.ObjJson["Comments"] = Number(this.ObjJson["Comments"]) + 1;
      this.lngComments = Number(this.lngComments) + 1;

      this.popTools.dismissLoading();
      this.popTools.showToast(this.sheetLabels["Social_NewCommentSuc"], null);
    } else {
      this.errorNotification(response);
    }
  }

  async showAddLikePrompt(lngIndex) {
    var strHeader = this.objLabel + ": " + this.sheetLabels["All_Object_Like"];
    this.popTools.showAddLikePrompt(strHeader, (data) => {
      if (data == 3) {
        var strTitle = this.title;
        var params = { ObjectType:this.ObjJson["ObjectType"], ObjectID: this.ObjJson["ObjectID"], Title: strTitle };
        this.popTools.showLikes(params, (data2) => {
          if (data2 > 0) {this.showMember(data2);}
        });
      } else if (data > 0) {
        this.sendLike(data)
      }
    });
  }
  
  sendLike(like) {
    this.popTools.showLoading();
    this.rest.postLike(this.ObjJson["ObjectType"], this.ObjJson["ObjectID"], like)
      .subscribe(
        response => this.parsLikeResponse(response, like),
        error =>  this.parsPostError(error));
  }

  parsLikeResponse(response, like) {
    var lngCount = 0;

    if (response.rowsAffected[0]) {
      if (like == 1) {
	      this.lngLikes = 1;
	      lngCount = Number(this.ObjJson["Likes"]);
	      lngCount = lngCount + 1;
        this.ObjJson["Likes"] = lngCount;
      } else {
	      this.lngNLikes = 1;
	      lngCount = Number(this.ObjJson["NLikes"]);
	      lngCount = lngCount + 1;
        this.ObjJson["NLikes"] = lngCount;
      }

      this.popTools.dismissLoading();
      this.popTools.showToast(this.sheetLabels["Social_LikeSet"], null);
    } else {
      this.errorNotification(response);
    }
  }

  parsPostError(error: any) {
    var strMessage = ""; var objError = {};

    this.popTools.dismissLoading();
    objError = JSON.parse(error);
    if (objError["code"]) {
      switch(objError["code"]) {
	      case "INVALID_TYPE":
	        strMessage = this.sheetLabels["errManInvalidAccess"];
	        break;
	      case "INVALID_PARAMETER":
	        strMessage = this.sheetLabels["errManInvalidAccess"];
	        break;
	      case "INVALID_ID":
	        strMessage = this.sheetLabels["errManInvalidAccess"];
	        break;
	      case "ALREADY_POSTED":
	        strMessage = this.sheetLabels["Social_AlreadyLiked"];
	        break;
	      case "ITEM_NOT_FOUND":
	        strMessage = this.sheetLabels["All_Item_Not_Found"];
	        break;
	      case "ACCESS_DENIED":
	        strMessage = this.sheetLabels["All_AccessDenied"];
	        break;
	      case "NOTHING_TO_POST":
	        strMessage = this.sheetLabels["Social_CommentMissin"];
	        break;
	      default:
	        strMessage = "";
      }
      if (strMessage == "") {
	      this.popTools.showAlert(this.sheetLabels["Al_SystemError"],JSON.stringify(error));
      } else {
	      this.popTools.showAlert(this.sheetLabels["All_CannotContinue"],strMessage);
      }	
    } else {
      this.popTools.showAlert(this.sheetLabels["Al_SystemError"],error);
    }
  }

  showMember(lngMemberID) {
   let params = { memberID: lngMemberID, isFriend: null };

   this.popRoutes.navigateForward('/member-profile', params);
  }

  doInfinite(infiniteScroll) {
    this.infiniteScroll = infiniteScroll;

    if (this.lastComment) {
      var lastDate = this.lastComment;

      this.lastComment = null;
      this.rest.getComments(this.ObjJson["ObjectType"], this.ObjJson["ObjectID"], lastDate, null)
         .subscribe(
	         comments => this.parsComments(comments),
           error =>  this.errorNotification(error));
    } else {
       this.infiniteScroll.target.complete();
       this.infiniteScroll.target.disabled = true;
    }
  }

  errorNotification(error) {
    this.errorMessage = <any>error;

    let jsonError = JSON.parse(error)
    if (this.infiniteScroll) {
       this.infiniteScroll.target.complete();
       this.infiniteScroll.target.disabled = true;
    }
    if (jsonError.code) {
      if (jsonError.code != "ITEM_NOT_FOUND") {console.log(error);}
    } else {
      console.log(error);
    }
  }

}
