import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UserDataService } from './../user-data.service';
import { DataServiceService } from './../data-service.service';
import { TranslateService } from '@ngx-translate/core';
import { PopTools } from './../pop-tools';
import { PopRoutes } from './../pop-routes';
import { environment } from './../../environments/environment';
import { Events } from '@ionic/angular';
import { CustomToastPage } from './../custom-toast/custom-toast.page';

@Component({
  selector: 'app-my-portal',
  templateUrl: './my-portal.page.html',
  styleUrls: ['./my-portal.page.scss'],
})
export class MyPortalPage implements OnInit {
  userID: string = '';
  userName: string = '';
  userFullname: string = '';
  userLikes: number = 0;
  userNLikes: number = 0;
  userComments: number = 0;
  userCreatedOn: string = '';
  userLastActive: string = '';
  PhotoLocation: string = '';
  userSpaceAcess: string = 'Access_Public';
  errorMessage: string;
  mode: string = environment.mode;
  popularisimoUrl: string = environment.popularisimoUrl;
  lastNotification: any;
  firstNotification: any;
  tempNotification: any;
  notifications = [];
  infiniteScroll: any;
  refresher: any;
  sheetLabels: any = {};
  formOptions = {"Mode":"EDIT", "Title":"", "Icon":""};
  
  constructor(private events: Events, private router: Router, private modalCtrl: ModalController, private UserData: UserDataService, 
    private rest: DataServiceService, private translate: TranslateService, private popTools: PopTools, private popRoutes: PopRoutes) { 

  }

  ngOnInit() {
    this.notifications = [];
    this.getUser();
    this.translate.stream(['All_Wait','Al_SystemError','Social_ConnectReques','Member_NoteSend','Member_NotSendToSelf','Member_AlreadyFriend','errManInvalidAccess',
			'errSecUsernameNotFound','All_CannotContinue','Member_Accepted','ALL_Notification_Removed','Member_AlreadySend','Group_AlreadyMember',
			'Group_AlreadyMember2','Group_Not_Found','All_AccessDenieds','Group_Accespted','Member_MyPortal','Social_MemberLike','All_Sow_Likes','All_Like',
			'All_DontLike','Social_LikeSet','Social_AlreadyLiked','All_Item_Not_Found','Social_NewUserCommen','Social_NewUserFoto','Social_NewUserVideo',
			'Social_NewUserDoc','Group_NewPhoto','Group_NewVideo','Group_NewDoc','Social_Pictures','Update_Message','Social_CommentAdd',
			'Social_NewCommentSuc','All_Online','All_Offline','All_View','Chat_Chat','All_Message','All_File']).subscribe(res => {
      this.sheetLabels = res;
    });	  	
  }

  getUser() {
    this.UserData.getUserInfo().subscribe(user => {
      if (user) {
		    this.startSocket();
        this.rest.getUser()
          .subscribe(
            myuser => this.extractInfo(myuser),
            error =>  this.errorMessage = <any>error);
      }
    });
  }
  
  startSocket() {
    var strMessage = "";
    var lngCount = 0;
    var parameter = 0;

    this.rest.socketStart(this.UserData.userToken);
    this.rest.socketListen().subscribe(data => {

      switch(data['Event']) {
	    case "Error":
//	      this.showAlert(this.sheetLabels["Al_SystemError"],data['Message']);
	      break;
	    case "Info":
	      strMessage = ""
	      switch(data['Message']) {
	        case "User_Connected":
			  strMessage = data['FullName'] + " " + this.sheetLabels["All_Online"];
			  lngCount = 0;
			  break;
	        case "User_Disconnected":
			  strMessage = data['FullName'] + " " + this.sheetLabels["All_Offline"];
			  lngCount = 0;
			  break;
			case "New_Mail":
			  if (this.UserData.unreadMessages == "") {
			    lngCount = 1;
			  } else {
				lngCount = Number(this.UserData.unreadMessages);
				lngCount = lngCount + 1;
				this.UserData.unreadMessages = lngCount.toString();
			  }
			  strMessage = data['FullName'] + " " + this.sheetLabels["All_Message"] + " : " + data['Extra'];
			  parameter = data['MessageID'];
			  lngCount = 1;
			  this.events.publish("Messenger", data);
			  break;
	      }
	      if (strMessage != "") {this.showEventToast(lngCount, parameter, strMessage, data['FullName'], data['PhotoLocation']);}

	      if (data['Message'] == "Message_Send" || data['Message'] == "Message_Read" || data['Message'] == "Message_Read_All" || data['Message'] == "User_Connected" || data['Message'] == "User_Disconnected") {
	        this.events.publish("chatMessage", data);
	      }
	      break;
	    case "Chat":
	      this.events.publish("chatMessage", data);
	      lngCount = data['Sender'];
	      if (lngCount != this.UserData.currentChatUser) {
	        strMessage = this.UserData.unreadChats;
	        lngCount = Number(strMessage);
	        lngCount = lngCount + 1;
	        this.UserData.unreadChats = lngCount.toString();

	        strMessage = "";
	        if (!data['Message'] || data['Message'] == "") {if (data['ObjectType'] && data['ObjectType'] > 0) {strMessage = "[" + this.sheetLabels["All_File"] + "]";}} else {strMessage = data['Message'];}
	        strMessage = data['FullName'] + " " + this.sheetLabels["Chat_Chat"] + " : " + strMessage;
	        this.showEventToast(2, data['Sender'], strMessage, data['FullName'], data['PhotoLocation']);
	      }
	      break;
	    default:	
	      console.log(JSON.stringify(data));
      }
    });	  
  }

  async showEventToast(lngAction: number, parameter: number, message: string, Fullname: string, PhotoLocation: string) {
    var strButtonText: string = 'Ok';

    if (lngAction > 0) {strButtonText = this.sheetLabels["All_View"];}
    let params = { Title: message, ButtonText: strButtonText, PhotoLocation: PhotoLocation };

    const formModal = await this.modalCtrl.create({
      component: CustomToastPage,
      componentProps: {"message": params},
	    showBackdrop: false,
	    cssClass: "toast-modal"
    });
    formModal.onDidDismiss().then((data) => {
      if (data != null && data["ActionOk"]) {
        switch(lngAction) {
		 case 1:
	       this.showMessage(parameter);
	       break;
	     case 2:
	       this.showChatMessages(parameter, Fullname, PhotoLocation);
	       break;
	    }
      }
    })   
    await formModal.present();   
  }
  
  extractInfo(myuser) {
// console.log(JSON.stringify(myuser));
    this.userID = myuser[0].ID;
    this.userName = myuser[0].Username;

    if (!myuser[0].Likes) {this.userLikes = 0;} else {this.userLikes = Number(myuser[0].Likes);}
    if (!myuser[0].NLikes) {this.userNLikes = 0;} else {this.userNLikes = Number(myuser[0].NLikes);}
    if (!myuser[0].Comments) {this.userComments = 0;} else {this.userComments = Number(myuser[0].Comments);}

    this.userCreatedOn = myuser[0].CreatedOn;
    this.userLastActive = myuser[0].LastActive;
    this.PhotoLocation = myuser[0].PhotoLocation;
    this.UserData.userPhoto = this.PhotoLocation;
    this.userFullname = myuser[0].FirstName + " " + myuser[0].LastName;
    if (myuser[0].LastName2) {this.userFullname = this.userFullname + " " + myuser[0].LastName2;}
    this.UserData.userFullname = this.userFullname;

    if (myuser[0].SpaceAccess == 0) {this.userSpaceAcess = "Access_Private";}
    this.getPrivacy();
    this.getNotifications();
    this.getChatStats();
    this.getMessagesStats();
  }

  getPrivacy() {
    this.rest.getPrivacy()
       .subscribe(
         privacy => this.parsUserPrivacy(privacy),
         error =>  this.errorMessage = <any>error);
  }

  getNotifications() {
    this.rest.getNotifications(null)
       .subscribe(
         notifications => this.parsNotifications(notifications, false),
         error =>  this.errorMessage = <any>error);
  }

  getChatStats() {
    this.rest.getChatStats()
       .subscribe(
         chatStats => this.parsChatStats(chatStats),
         error =>  this.errorMessage = <any>error);
  }

  getMessagesStats() {
    this.rest.getMessagesStats()
       .subscribe(
         messagesStats => this.parsMessagesStat(messagesStats),
         error =>  this.errorMessage = <any>error);
  }

  parsUserPrivacy(privacy) {
    this.UserData.userPrivacy = privacy[0];
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
       this.refresher.target.complete();
    }
  }

  parsChatStats(chatStats) {
    var lnCount = 0;

    chatStats.forEach(chatStat => {
	    lnCount = lnCount + chatStat.Unread;
    });
    if (lnCount > 0) {
	    this.UserData.unreadChats = lnCount.toString();
    } else {
	    this.UserData.unreadChats = "";
    }
  }

  parsMessagesStat(messagesStat) {
    var lnCount = 0;

    messagesStat.forEach(messageStat => {
	    lnCount = lnCount + messageStat.Unread;
    });
    if (lnCount > 0) {
	    this.UserData.unreadMessages = lnCount.toString();
    } else {
	    this.UserData.unreadMessages = "";
    }
  }

  parsConnectResult(result: any, itemIndex: number) {
   this.popTools.dismissLoading();

   if (result.rowsAffected[0]) {
      this.notifications.splice(itemIndex, 1);
      this.popTools.showAlert(this.sheetLabels["Social_ConnectReques"],this.sheetLabels["Member_Accepted"]);
    } else {
      this.popTools.showAlert(this.sheetLabels["Al_SystemError"],JSON.stringify(result));
    }
  }

  parsConnectError(error: any) {
    var strMessage = ""; var objError = {};

    this.popTools.dismissLoading();
    objError = JSON.parse(error);
    if (objError["code"]) {
      switch(objError["code"]) {
	      case "CANNOT_SEND_TO_SELF":
	        strMessage = this.sheetLabels["Member_NotSendToSelf"];
	        break;
	      case "ALREADY_FRIENDS":
	        strMessage = this.sheetLabels["Member_AlreadyFriend"];
	        break;
	      case "MEMBER_NOT_FOUND":
	        strMessage = this.sheetLabels["errSecUsernameNotFound"];
	        break;
	      case "REQUEST_NOT_PRESENT":
	        strMessage = this.sheetLabels["errManInvalidAccess"];
	        break;
	      case "REQUEST_ALREADY_SEND":
	        strMessage = this.sheetLabels["Member_AlreadySend"];
	        break;
	      case "ALREADY_MEMBER":
	        strMessage = this.sheetLabels["Group_AlreadyMember"];
	        break;
	      case "ALREADY_MEMBER2":
	        strMessage = this.sheetLabels["Group_AlreadyMember2"];
	        break;
	      case "GROUP_NOT_FOUND":
	        strMessage = this.sheetLabels["Group_Not_Found"];
	        break;
	      case "USER_NOT_FOUND":
	        strMessage = this.sheetLabels["errSecUsernameNotFound"];
	        break;
	      case "ACCESS_DENIED":
	        strMessage = this.sheetLabels["All_AccessDenieds"];
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

  async newPost() {
    let postString = "";
    this.formOptions.Title = this.sheetLabels["Social_CommentAdd"];
    let params = {"options": this.formOptions};
    
    this.popRoutes.showModal("CommentAddPage", params, (data) => {
      if (data != null) {
        for (var key in data) {
          if (postString != "") {postString = postString + "&";}
          postString = postString + key + "=" + data[key];
        }
		
        this.popTools.showLoading();		
        this.rest.newPosts(null, postString).subscribe(
          response => this.showNewPost(data),
          error =>  this.parsConnectError(error)
        );
      }
    });    
  }

  showNewPost(data) {
    this.popTools.dismissLoading();
    this.tempNotification = this.firstNotification;
    this.firstNotification = null;
    this.rest.getNewNotifications(this.tempNotification).subscribe(
         notifications => this.showNewPostSuccess(notifications),
         error =>  this.errorMessage = <any>error
    );
  }

  showNewPostSuccess(notifications) {
    this.parsNotifications(notifications, true)
    this.showEventToast(0, 0, this.sheetLabels["Social_NewCommentSuc"], "", this.UserData.userPhoto);
  }
	
  async changePhoto() {
   let postString = "";
   this.formOptions.Title = this.sheetLabels["Social_Pictures"];
   
   let params = { "resourceIndex": 1, "options": this.formOptions };
   this.popRoutes.showModal("SelectMyResourcePage", params, (data) => {
    if (data) {
      postString = "PhotoLocation=" + data["resourceLocation"];
      this.popTools.showLoading();
      this.rest.patchUserSpace(postString)
       .subscribe(
         response => this.parsChangePhotoResponse(response, data["resourceLocation"]),
         error =>  this.errorNotification(error));
    }
   });
  }

  parsChangePhotoResponse(response, strPhoto) {
    this.popTools.dismissLoading();
    if (response.rowsAffected[0]) {
      this.popTools.showToast(this.sheetLabels["Update_Message"], null);
      this.PhotoLocation = this.popularisimoUrl + strPhoto.replace(/\\/g,"/");
    } else {
      this.popTools.showAlert(this.sheetLabels["Al_SystemError"],JSON.stringify(response));
    }
  }

  acceptMemberConnect(memberID,itemIndex) {
    this.popTools.showLoading();
    this.rest.postFriendAcceptNotification(memberID)
       .subscribe(
         result => this.parsConnectResult(result, itemIndex),
         error =>  this.parsConnectError(error));
  }

  parsMembershipResult(result: any, itemIndex: number) {
    this.popTools.dismissLoading();
    if (result.rowsAffected[0]) {
      this.notifications.splice(itemIndex, 1);
      this.popTools.showAlert(this.sheetLabels["Group_ConnectReques"],this.sheetLabels["Group_Accespted"]);
    } else {
      this.popTools.showAlert(this.sheetLabels["Al_SystemError"],JSON.stringify(result));
    }
  }

  acceptGroupMembership(noteType,groupID,userID,itemIndex) {
    if (noteType == 5) {

      this.popTools.showLoading();
      this.rest.postGroupAcceptRequestNotification(groupID,userID)
        .subscribe(
          result => this.parsMembershipResult(result, itemIndex),
          error =>  this.parsConnectError(error));
    } else {
 
      this.popTools.showLoading();
      this.rest.postGroupAcceptSugestNotification(groupID)
        .subscribe(
          result => this.parsMembershipResult(result, itemIndex),
          error =>  this.parsConnectError(error));
    }
  }

  parsconsumeNotification(error: any, result: any, itemIndex: number) {
    this.popTools.dismissLoading();
    if (error) {
      this.popTools.showAlert(this.sheetLabels["Al_SystemError"],JSON.stringify(result));
    } else {
      if (result.rowsAffected[0]) {
        this.notifications.splice(itemIndex, 1);
        this.popTools.showToast(this.sheetLabels["ALL_Notification_Removed"], null);
      } else {
        this.popTools.showAlert(this.sheetLabels["Al_SystemError"],JSON.stringify(result));
      }
    }
  }

  consumeNotification(itemID, itemIndex) {
    this.popTools.showLoading();
    this.rest.patchConsumeNotification(itemID)
       .subscribe(
         result => this.parsconsumeNotification(null, result, itemIndex),
         error =>  this.parsconsumeNotification(error, null, itemIndex));
  }

  showMessage(lngMessageID) {
   let params = { messageID: lngMessageID, folderID: 0 };

   this.popRoutes.navigateForward('/message-details', params);
  }

  showChatMessages(lngFriendID,strFullName,strPhotoLocation) {
   let params = { friendID: lngFriendID, fullName: strFullName, PhotoLocation: strPhotoLocation, Unread: "" };

   this.popRoutes.navigateForward('/chat-room', params);
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

  showForumMessage(lngMessageID) {
   let params = { forumName: "", messageID: lngMessageID };

   this.popRoutes.navigateForward('/forum-message', params);
  }

  showMailMessage(lngMessageID) {
   let params = { messageID: lngMessageID, folderID: 1 };

   this.popRoutes.navigateForward('/message-details', params);
  }

  showProduct(lngIndex) {
   let params = { productID: this.notifications[lngIndex].GroupID, groupID: this.notifications[lngIndex].lngMore };

   this.popRoutes.navigateForward('/product', params);
  }

  showPDF(lngIndex) {
    var params = { pdfSrc: this.notifications[lngIndex].ExtraData.Location };
 
    this.popRoutes.navigateForward('/pdf-viewer', params);
  }
 
   showProfile() {
   var strDescription = this.sheetLabels["Member_MyPortal"] + " " + this.userFullname;
   var params = {"Location": this.PhotoLocation, "Description":strDescription, "NoIcons":null,
		 "ShowComments":true, "Likes": this.userLikes, "NLikes": this.userNLikes,
		 "Comments": this.userComments, "ObjectType":"member", "ObjectID":this.userID, 
		 "resourceType": 1};

   let pageClosed = (retData)=>{
     if (retData.Likes != null && retData.Likes > 0) {this.increaseObjectCount(1, 1);}
     if (retData.NLikes != null && retData.NLikes > 0) {this.increaseObjectCount(2, 1);}
     if (retData.Comments != null && retData.Comments > 0) {this.increaseObjectCount(3, retData.Comments);}
   }
   params["pageClosed"] = pageClosed;
   this.popRoutes.navigateForward('/show-photo', params);
  }

  increaseObjectCount(lngIndex, lngValue) {
    var lngCount = 0;

    switch(lngIndex) {
      case 1:
	      lngCount = Number(this.userLikes) + lngValue;
	      this.userLikes = lngCount
	      break;
      case 2:
	      lngCount = Number(this.userNLikes) + lngValue;
	      this.userNLikes = lngCount
	      break;
      case 3:
	      lngCount = Number(this.userComments) + Number(lngValue);
	      this.userComments = lngCount
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

  showAddLikePrompt(lngIndex) {
    var lngNoteType = 0;
    var strTitle = "";
    var strObjectType = "";
    var lngObjectID = this.userID;
 
    if (lngIndex >= 0) {
     lngObjectID = this.notifications[lngIndex].lngExtra;
     lngNoteType = this.notifications[lngIndex].NoteType;
    }
    switch(lngNoteType) {
      case 0:
       strObjectType = "member";
       strTitle = this.sheetLabels["Member_MyPortal"] + " " + this.userFullname;
       break;
      case 9:
      case 10:
      case 12:
      case 13:
       strObjectType = "post";
       strTitle = this.sheetLabels["Social_NewUserCommen"];
       break;
      case 11:
       strObjectType = "picture";
       strTitle = this.sheetLabels["Social_NewUserFoto"];
       break;
      case 14:
       strObjectType = "video";
       strTitle = this.sheetLabels["Social_NewUserVideo"];
       break;
      case 15:
       strObjectType = "document";
       strTitle = this.sheetLabels["Social_NewUserDoc"];
       break;
      case 16:
       strObjectType = "picture";
       strTitle = this.sheetLabels["Group_NewPhoto"];
       break;
      case 17:
       strObjectType = "video";
       strTitle = this.sheetLabels["Group_NewVideo"];
       break;
      case 18:
       strObjectType = "document";
       strTitle = this.sheetLabels["Group_NewDoc"];
       break;
      default:
       strObjectType = "picture";
       strTitle = this.sheetLabels["Social_NewUserFoto"];
       break;
    }
 
    let params = { ObjectType:strObjectType, ObjectID: lngObjectID, Title: strTitle }; 
    this.popTools.showAddLikePrompt(this.sheetLabels["Social_MemberLike"], (data) => {
      if (data == 3) {
        this.popTools.showLikes(params, (data2) => {
          if (data2 > 0) {this.showMember(data2, null);}
        });
      } else if (data > 0) {
        this.sendLike(lngIndex,data)
      }
    });
  }
  
  sendLike(lngIndex,like) {
   var lngNoteType = 0;
   var strObjectType = "";
   var lngObjectID = this.userID;

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

    if (response.rowsAffected[0]) {
      if (lngIndex < 0) {
	      if (like == 1) {
	        this.userLikes = this.userLikes + 1;
	      } else {
	        this.userNLikes = this.userNLikes + 1;
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
	    this.popTools.dismissLoading();
      this.popTools.showToast(this.sheetLabels["Social_LikeSet"], null);
    } else {
      this.errorNotification(response);
    }
  }

  errorNotification(error) {
    this.popTools.dismissLoading();
    this.errorMessage = <any>error;

    if (this.infiniteScroll) {
       this.infiniteScroll.target.complete();
       this.infiniteScroll.target.disabled = true;
    }
    if (this.refresher) {
       this.firstNotification = this.tempNotification;
       this.refresher.target.complete();
    }
  }

  doInfinite(infiniteScroll) {
    this.infiniteScroll = infiniteScroll;

    if (this.lastNotification) {
      var lastDate = this.lastNotification;

      this.lastNotification = null;
      this.rest.getNotifications(lastDate)
         .subscribe(
           notifications => this.parsNotifications(notifications, false),
           error =>  this.errorNotification(error));	
    }
  }

  doRefresh(refresher) {
    this.refresher = refresher;

    if (this.refresher && this.firstNotification != null) {
      this.tempNotification = this.firstNotification;

      this.firstNotification = null;
      this.rest.getNewNotifications(this.tempNotification).subscribe(
           notifications => this.parsNotifications(notifications, true),
           error =>  this.errorNotification(error)
      );
	  } else {
	    refresher.target.complete();;
    }
  }
	
}
