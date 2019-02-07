import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UserDataService } from './../user-data.service';
import { DataServiceService } from './../data-service.service';
import { TranslateService } from '@ngx-translate/core';
import { PopTools } from './../pop-tools';
import { PopRoutes } from './../pop-routes';

@Component({
  selector: 'app-member-profile',
  templateUrl: './member-profile.page.html',
  styleUrls: ['./member-profile.page.scss'],
})
export class MemberProfilePage implements OnInit {
  errorMessage: string;
  memberID: number = 0;
  member = {FullName:"", SpaceAcess:"", PhotoLocation:"", Likes:0, NLikes:0, Comments:0, IsFriend:0};
  lastNotification: any;
  firstNotification: any;
  tempNotification: any;
  notifications = [];
  infiniteScroll: any;
  refresher: any;
  parentCaller: string = "";
  isFriend: boolean = false;
  formOptions = {"Mode":"ADD", "Title":"", "Icon":""};
  sheetLabels: any = {};

  constructor(private router: Router, private modalCtrl: ModalController, private UserData: UserDataService, private rest: DataServiceService, 
    private translate: TranslateService, private popTools: PopTools, private popRoutes: PopRoutes) { 

    this.translate.stream(['Member_GuestPortal','All_SocialOptions', 'Main_Friends','Social_Pictures','Social_Videos',
			'Social_Documents','Social_CommentAdd','All_WatchFriend','All_MailOptions','Message_View',
			'Message_SendA','All_BTN_Cancel','Social_NewUserFoto','Social_NewUserVideo','Social_NewUserCommen',
			'Social_NewUserDoc','Group_NewPhoto','Group_NewVideo','All_Wait','Al_SystemError',
			'Social_NewCommentSuc','errManInvalidAccess','Social_AlreadyLiked','All_Item_Not_Found',
			'All_AccessDenied','All_CannotContinue','Social_MemberLike','All_Like','All_DontLike',
			'All_Sow_Likes','Social_LikeSet','Member_NotSendToSelf','Member_AlreadyFriend','Member_AlreadySend',
			'Message_Send','errSecUsernameNotFound','Social_MemberConnect','Member_NoteSend','Member_Connect',
			'Member_ConnectLong']).subscribe(res => {

      this.sheetLabels = res;
    });
  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    let myParams = this.popRoutes.getCurrentParam();
    this.notifications = [];
    if (myParams) {
      if (myParams["parent"]) {this.parentCaller = myParams["parent"];}
      if (myParams.memberID) {
        this.memberID = myParams.memberID;
      }
      this.isFriend = myParams.isFriend;
    }

    if (this.memberID > 0) {
      this.getUser();
    }
  }

  goBack() {
    this.popRoutes.navigateBackwards();
  }

  getUser() {
    this.rest.getMember(this.memberID)
      .subscribe(
        myuser => this.extractInfo(myuser),
        error =>  this.errorMessage = <any>error);
  }
  
  extractInfo(myuser) {

    this.member = myuser[0];
    
    this.member.SpaceAcess = "Access_Public";
    if (myuser[0].SpaceAccess == 0) {this.member.SpaceAcess = "Access_Private";}
    if (!this.member.Likes) {this.member["userLikes"] = 0;} else {this.member["userLikes"] = this.member.Likes;}
    if (!this.member.NLikes) {this.member["userNLikes"] = 0;} else {this.member["userNLikes"] = this.member.NLikes;}
    if (!this.member.Comments) {this.member["userComments"] = 0;} else {this.member["userComments"] = this.member.Comments;}
    if (this.isFriend == null) {if (this.UserData.currentUser) {if (this.UserData.currentUser.user_id == this.memberID) {this.isFriend = true;}}}
    if (this.isFriend == null) {this.isFriend = Boolean(this.member.IsFriend == 1);}
    this.getNotifications();
  }

  getNotifications() {
    this.rest.getMemberNotifications(this.memberID,null)
       .subscribe(
         notifications => this.parsNotifications(notifications, false),
         error =>  this.errorMessage = <any>error);
  }

  parsNotifications(notifications, blnNew) {
    var blnFirstFound = false;

    notifications.forEach(notification => {
    switch(notification.NoteType) {
	    case 16:
	    case 17:
	    case 18:
	    case 22:
	    case 24:
	    case 25:
		notification.userNotification = false;
		break;
	    default:
		notification.userNotification = true;
	}

	if (notification.ExtraData != null && notification.ExtraData.Likes != null) {
	  notification.ShowLikes = true;
	} else {
	  notification.ShowLikes = false;
	}
	this.lastNotification = notification.DateSend;
	if (!blnFirstFound) {
	  blnFirstFound = true;
	  this.firstNotification = notification.DateSend;
	}
	if (!blnNew) {
          this.notifications.push(notification);
	} else {
          this.notifications.unshift(notification);
	}
    });

    if (this.infiniteScroll) {
       this.infiniteScroll.target.complete();
    }
    if (this.refresher) {
       this.refresher.complete();
    }
  }

  errorNotification(error) {
    this.errorMessage = <any>error;

    if (this.infiniteScroll) {
       this.infiniteScroll.target.complete();
       this.infiniteScroll.target.disabled = true;
    }
    if (this.refresher) {
       this.firstNotification = this.tempNotification;
       this.refresher.complete();
    }
  }

  doInfinite(infiniteScroll) {
    this.infiniteScroll = infiniteScroll;

    if (this.lastNotification) {
      var lastDate = this.lastNotification;

      this.lastNotification = null;
      this.rest.getMemberNotifications(this.memberID,lastDate)
         .subscribe(
           notifications => this.parsNotifications(notifications, false),
           error =>  this.errorNotification(error));	
    }
  }

  doRefresh(refresher) {
    this.refresher = refresher;

    if (this.refresher) {
      this.tempNotification = this.firstNotification;

      this.firstNotification = null;
      this.rest.getNewMemberNotifications(this.memberID, this.tempNotification)
         .subscribe(
           notifications => this.parsNotifications(notifications, true),
           error =>  this.errorNotification(error));
    }
  }

  showResource(strResourcePage,resourceIndex) {
   let params = { memberID: this.memberID, resourceIndex: resourceIndex, Fullname: this.member.FullName };

   this.popRoutes.navigateForward(strResourcePage, params);
  }

  showFriends() {
   let params = { memberID: this.memberID, Fullname: this.member.FullName };

   this.popRoutes.navigateForward('/friends', params);
  }

  showGroups() {
   let params = { memberID: this.memberID, Fullname: this.member.FullName };

   this.popRoutes.navigateForward('/tabs/groups', params);
  }

  showProducts() {
   let params = { memberID: this.memberID, groupID: 0, Fullname: this.member.FullName };

   this.popRoutes.navigateForward('/tabs/market', params);
  }

  showFriendMessages() {
   let params = { friendID: this.memberID, friendFullname: this.member.FullName };

   this.popRoutes.navigateForward('/messenger', params);
  }

  showMember(lngMemberID, lngNoteType) {
   var blnFriend = Boolean(lngNoteType > 1);

   if (lngNoteType == null) {blnFriend = null;}
   let params = { memberID: lngMemberID, isFriend: blnFriend };

   this.popRoutes.navigateForward('/member-profile', params);
  }

  showGroup(lngGroupID) {
   let params = { groupID: lngGroupID };

   this.popRoutes.navigateForward('/group-details', params);
  }

  showChatMessages() {
    let params = { friendID: this.memberID, fullName: this.member.FullName, PhotoLocation: this.member.PhotoLocation };
    
    if (this.isFriend) {
      this.popRoutes.navigateForward('/chat-room', params);
     }
  }
 
  showPDF(lngIndex) {
   var params = { pdfSrc: this.notifications[lngIndex].ExtraData.Location };

   this.popRoutes.navigateForward('/pdf-viewer', params);
  }

  showProfile() {
   var strDescription = this.sheetLabels.Member_GuestPortal + " " + this.member.FullName;
   var params = {Location: this.member.PhotoLocation, Description:strDescription, NoIcons:null,
		 ShowComments:true, "Likes": this.member.Likes, "NLikes": this.member.NLikes,
		 "Comments": this.member.Comments, "ObjectType":"member", "ObjectID":this.memberID, 
		 "resourceType": 1};

   let pageClosed = (retData)=>{
     if (retData.Likes != null && retData.Likes > 0) {this.increaseObjectCount(1, 1);}
     if (retData.NLikes != null && retData.NLikes > 0) {this.increaseObjectCount(2, 1);}
     if (retData.Comments != null && retData.Comments > 0) {this.increaseObjectCount(3, retData.Comments);}
   }
   params["pageClosed"] = pageClosed;
   this.popRoutes.navigateForward('/show-photo', params);
  }

  async showMemberConnectPrompt() {
    let inputs = [
        {
          name: 'message',
          placeholder: this.sheetLabels.All_Message
        },
      ];
    let buttons = [
        {
          text: this.sheetLabels.All_BTN_Cancel,
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: this.sheetLabels.Message_Send,
          handler: data => {
            this.connectMember(data.message);
          }
        }
      ];

    this.popTools.showAlertList(this.sheetLabels.Member_Connect, this.sheetLabels.Member_ConnectLong, inputs, buttons);
  }

  connectMember(message) {
    this.popTools.showLoading();
    this.rest.postFriendRequestNotification(this.memberID,message)
       .subscribe(
         result => this.parsConnectResult(result),
         error =>  this.popTools.parsPostError(error));
  }

  parsConnectResult(result: any) {
    this.popTools.dismissLoading();
    if (result.rowsAffected[0]) {
      this.popTools.showAlert(this.sheetLabels.Social_MemberConnect,this.sheetLabels.Member_NoteSend);
    } else {
      this.popTools.showAlert(this.sheetLabels.Al_SystemError,JSON.stringify(result));
    }
  }

  increaseObjectCount(lngIndex, lngValue) {
    var lngCount = 0;

    switch(lngIndex) {
      case 1:
        lngCount = Number(this.member.Likes) + lngValue;
        this.member.Likes = lngCount
        this.member["userLikes"] = lngCount;
        break;
      case 2:
        lngCount = Number(this.member.NLikes) + lngValue;
        this.member.NLikes = lngCount
        this.member["userNLikes"] = lngCount;
        break;
      case 3:
        lngCount = Number(this.member.Comments) + lngValue;
        this.member.Comments = lngCount
        this.member["userComments"] = lngCount;
        break;
    }
  }

  showObject(lngIndex,strType) {
   var ObjectData = {};
   var lngNoteType = this.notifications[lngIndex].NoteType;
   var params = {Location: "", Description:"", NoIcons:true, ShowComments:false, "Likes": null, "NLikes": null, "Comments": null, "ObjectType":strType};

   if (lngNoteType == 22 && this.notifications[lngIndex].GroupData) {
     ObjectData = this.notifications[lngIndex].GroupData;
   } else if (this.notifications[lngIndex].ExtraData) {
     ObjectData = this.notifications[lngIndex].ExtraData;
   } else if (this.notifications[lngIndex].GroupData) {
     ObjectData = this.notifications[lngIndex].GroupData;
   }

   if (ObjectData["Location"] != null) {
     params["Location"] = ObjectData["Location"];
   } else if (ObjectData["PhotoLocation"] != null) {
     params["Location"] = ObjectData["PhotoLocation"];
   } else if (this.notifications[lngIndex].ObjectLocation != null) {
     params["Location"] = this.notifications[lngIndex].ObjectLocation;
   }

   if (ObjectData["NoteText"]) {
     params["Description"] = ObjectData["NoteText"];
   } else if (ObjectData["GroupName"]) {
     params["Description"] = ObjectData["GroupName"];
   } else if (ObjectData["Title"]) {
     params["Description"] = ObjectData["Title"];
     if (ObjectData["Description"]) {params["Description"] = params["Description"] + "<BR>" + ObjectData["Description"]}
   } else if (ObjectData["Description"]) {
     params["Description"] = ObjectData["Description"];
   }

   if (ObjectData["Likes"] != null) {
     params["Likes"] = ObjectData["Likes"];
     params["NLikes"] = ObjectData["NLikes"];
     params["Comments"] = ObjectData["Comments"];
     params["NoIcons"] = null;
     params["ShowComments"] = true;
   }

   params["ObjectID"] = this.notifications[lngIndex].lngExtra;
   if (params["ObjectID"] == null || params["ObjectID"] == 0 || lngNoteType == 20 || lngNoteType == 21 || lngNoteType == 22){
     switch(lngNoteType) {
      case 5:
      case 6:
      case 7:
      case 8:
      case 20:
      case 21:
      case 22:
	      params["ObjectID"] = this.notifications[lngIndex].GroupID;
        break;
     }
   }

   params["resourceType"] = this.notifications[lngIndex].lngMore;
   if (params["resourceType"] == null){
     switch(lngNoteType) {
      case 11:
      case 16:
      case 22:
        params["resourceType"] = 1;
        break;
      case 14:
      case 17:
        params["resourceType"] = 2;
        break;
      case 15:
      case 18:
        params["resourceType"] = 3;
        break;
     }
   }

   let pageClosed = (retData)=>{
     if (retData.Likes != null && retData.Likes > 0) {this.increaseCount(lngIndex, "Likes", 1);}
     if (retData.NLikes != null && retData.NLikes > 0) {this.increaseCount(lngIndex, "NLikes", 1);}
     if (retData.Comments != null && retData.Comments > 0) {this.increaseCount(lngIndex, "Comments", retData.Comments);}
   }
   params["pageClosed"] = pageClosed;
   this.popRoutes.navigateForward('/show-photo', params);
  }

  increaseCount(lngIndex, strObject, lngValue) {
    var lngCount = 0;

    if (this.notifications[lngIndex].ExtraData) {
      lngCount = Number(this.notifications[lngIndex].ExtraData[strObject]) + lngValue;
      this.notifications[lngIndex].ExtraData[strObject] = lngCount
    } else if (this.notifications[lngIndex].GroupData) {
      lngCount = Number(this.notifications[lngIndex].GroupData[strObject]) + lngValue;
      this.notifications[lngIndex].GroupData[strObject] = lngCount
    }
  }

  async showAddLikePrompt(lngIndex) {
      this.popTools.showAddLikePrompt(this.sheetLabels["Social_MemberLike"], (data) => {
        if (data == 3) {
          this.showLikes(lngIndex);
        } else if (data > 0) {
          this.sendLike(lngIndex, data)
        } 
      }); 
  }
  
  async showLikes(lngIndex) {
   var lngNoteType = 0;
   var strTitle = "";
   var strObjectType = "";
   var lngObjectID = this.memberID;

   if (lngIndex >= 0) {
    lngObjectID = this.notifications[lngIndex].lngExtra;
    lngNoteType = this.notifications[lngIndex].NoteType;
   }
   switch(lngNoteType) {
     case 0:
	    strObjectType = "member";
	    strTitle = this.sheetLabels.Member_GuestPortal + " " + this.member.FullName;
	    break;
     case 9:
     case 10:
     case 12:
     case 13:
	    strObjectType = "post";
	    strTitle = this.sheetLabels.Social_NewUserCommen;
	    break;
     case 11:
	    strObjectType = "picture";
	    strTitle = this.sheetLabels.Social_NewUserFoto;
	    break;
     case 14:
	    strObjectType = "video";
	    strTitle = this.sheetLabels.Social_NewUserVideo;
	    break;
     case 15:
	    strObjectType = "document";
	    strTitle = this.sheetLabels.Social_NewUserDoc;
	    break;
     case 16:
	    strObjectType = "picture";
	    strTitle = this.sheetLabels.Group_NewPhoto;
	    break;
     case 17:
	    strObjectType = "video";
	    strTitle = this.sheetLabels.Group_NewVideo;
	    break;
     case 18:
	    strObjectType = "document";
	    strTitle = this.sheetLabels.Group_NewDoc;
	    break;
     default:
	    strObjectType = "picture";
	    strTitle = this.sheetLabels.Social_NewUserFoto;
	    break;
   }

    let params = { ObjectType:strObjectType, ObjectID: lngObjectID, Title: strTitle };
    this.popRoutes.showModal("ShowLikesPage",params, (data) => {
      if (data) {
        this.showMember(data["likeUserID"], null)
      }
    });
  }

  sendLike(lngIndex,like) {
   var lngNoteType = 0;
   var strObjectType = "";
   var lngObjectID = this.memberID;

   if (lngIndex >= 0) {
    lngObjectID = this.notifications[lngIndex].lngExtra;
    lngNoteType = this.notifications[lngIndex].NoteType;
   }
   switch(lngNoteType) {
     case 0:
	    strObjectType = "member";
	    break;
     case 9:
     case 10:
     case 12:
     case 13:
	    strObjectType = "post";
	    break;
     case 11:
	    strObjectType = "picture";
	    break;
     case 14:
	    strObjectType = "video";
	    break;
     case 15:
	    strObjectType = "document";
	    break;
     case 16:
	    strObjectType = "picture";
	    break;
     case 17:
	    strObjectType = "video";
	    break;
     case 18:
	    strObjectType = "document";
	    break;
     default:
	    strObjectType = "picture";
	    break;
   }

   this.popTools.showLoading();
   this.rest.postLike(strObjectType, lngObjectID, like)
     .subscribe(
       response => this.parsLikeResponse(response, lngIndex, like),
       error =>  this.popTools.parsPostError(error));
  }

  parsLikeResponse(response,lngIndex,like) {
    var lngCount = 0;

    this.popTools.dismissLoading();
    if (response.rowsAffected[0]) {
      if (lngIndex < 0) {
	      if (like == 1) {
	        lngCount = Number(this.member["userLikes"]) + 1;
	        this.member["userLikes"] = lngCount;
	      } else {
	        lngCount = Number(this.member["userNLikes"]) + 1;
	        this.member["userNLikes"] = lngCount;
	      }
      } else {
	      if (like == 1) {
	        lngCount = Number(this.notifications[lngIndex].ExtraData.Likes) + 1;
	        this.notifications[lngIndex].ExtraData.Likes = lngCount;
	      } else {
	        lngCount = Number(this.notifications[lngIndex].ExtraData.NLikes) + 1;
	        this.notifications[lngIndex].ExtraData.NLikes = lngCount;
	      }
      }

      this.popTools.showToast(this.sheetLabels.Social_LikeSet, null);
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
	        strMessage = this.sheetLabels.errManInvalidAccess;
	        break;
	      case "INVALID_PARAMETER":
	        strMessage = this.sheetLabels.errManInvalidAccess;
	        break;
	      case "INVALID_ID":
	        strMessage = this.sheetLabels.errManInvalidAccess;
	        break;
	      case "ALREADY_POSTED":
	        strMessage = this.sheetLabels.Social_AlreadyLiked;
	        break;
	      case "ITEM_NOT_FOUND":
	        strMessage = this.sheetLabels.All_Item_Not_Found;
	        break;
	      case "ACCESS_DENIED":
	        strMessage = this.sheetLabels.All_AccessDenied;
	        break;

	      case "CANNOT_SEND_TO_SELF":
	        strMessage = this.sheetLabels.Member_NotSendToSelf;
	        break;
	      case "ALREADY_FRIENDS":
	        strMessage = this.sheetLabels.Member_AlreadyFriend;
	        break;
	      case "MEMBER_NOT_FOUND":
	        strMessage = this.sheetLabels.errSecUsernameNotFound;
	        break;
	      case "REQUEST_ALREADY_SEND":
	        strMessage = this.sheetLabels.Member_AlreadySend;
	        break;
	      default:
	        strMessage = "";
      }
      if (strMessage == "") {
	      this.popTools.showAlert(this.sheetLabels.Al_SystemError,JSON.stringify(error));
      } else {
	      this.popTools.showAlert(this.sheetLabels.All_CannotContinue,strMessage);
      }	
    } else {
      this.popTools.showAlert(this.sheetLabels.Al_SystemError,error);
    }
  }

  async newPost() {
    let postString = "";
    this.formOptions.Title = this.sheetLabels.Social_CommentAdd;
    this.formOptions.Icon = "../../assets/imgs/note.png";

    let params = {options: this.formOptions}
    this.popRoutes.showModal("CommentAddPage", params, (data) => {
      if (data) {
        for (var key in data) {
          if (postString != "") {postString = postString + "&";}
          postString = postString + key + "=" + data[key];
        }
 
        this.popTools.showLoading();
        this.rest.newPosts(this.memberID, postString).subscribe(
          response => this.showNewPost(response),
          error =>  this.popTools.parsPostError(error)
        );
      }
    });
  }
  
  showNewPost(data) {
    this.tempNotification = this.firstNotification;

    this.popTools.dismissLoading();
    this.firstNotification = null;
    this.rest.getNewMemberNotifications(this.memberID, this.tempNotification)
       .subscribe(
         notifications => this.parsNotifications(notifications, true),
         error =>  this.errorNotification(error));

    this.popTools.showToast(this.sheetLabels.Social_NewCommentSuc, this.UserData.userPhoto);
  }

  async presentSocialActionSheet() {
   let buttons = [];
   buttons.push({
           text: this.sheetLabels.Main_Friends,
           icon: 'contacts',
           handler: () => {
             this.showFriends();
           }
   });
   if (this.isFriend) {
     buttons.push({
           text: this.sheetLabels.Social_Pictures,
           icon: 'images',
           handler: () => {
             this.showResource("member-resources",1);
           }
     });
   }
   if (this.isFriend) {
     buttons.push({
           text: this.sheetLabels.Social_Videos,
           icon: 'videocam',
           handler: () => {
             this.showResource("member-resources",2);
           }
     });
   }
   if (this.isFriend) {
     buttons.push({
           text: this.sheetLabels.Social_Documents,
           icon: 'book',
           handler: () => {
             this.showResource("member-resources",3);
           }
     });
   }

   if (this.isFriend) {
      buttons.push({
           text: this.sheetLabels.Social_CommentAdd,
           icon: 'paper',
           handler: () => {
             this.newPost();
           }
      });
   }
   if (this.isFriend) {
      buttons.push({
           text: this.sheetLabels.All_WatchFriend,
           icon: 'eye',
           handler: () => {
             this.emptyMethod();
           }
      });
   }

   this.popTools.showActionSheet(this.sheetLabels.All_SocialOptions, buttons);
  }
  
  async presentMessageActionSheet() {
    let buttons = [
       {
         text: this.sheetLabels.Message_View,
         icon: 'eye',
         handler: () => {
           this.showFriendMessages();
         }
       },
       {
         text: this.sheetLabels.Message_SendA,
         icon: 'send',
         handler: () => {
           this.emptyMethod();
         }
       },
       {
         text: this.sheetLabels.All_BTN_Cancel,
         icon: 'close',
         role: 'cancel',
         handler: () => { }
       }
     ];

    this.popTools.showActionSheet(this.sheetLabels.All_MailOptions, buttons);
  }
  
  emptyMethod() {

  }

}
