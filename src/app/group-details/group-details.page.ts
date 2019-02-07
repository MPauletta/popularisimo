import { Router } from '@angular/router';
import { Component, OnInit, NgZone } from '@angular/core';
import { DataServiceService } from './../data-service.service';
import { TranslateService } from '@ngx-translate/core';
import { PopTools } from './../pop-tools';
import { PopRoutes } from './../pop-routes';

@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.page.html',
  styleUrls: ['./group-details.page.scss'],
})
export class GroupDetailsPage implements OnInit {
  group = {"GroupName":"","GroupType":2,"GroupTopic":"","IsPublic":true,"IsActive":true,"PhotoLocation":"", "Description":"", "Likes":"", "NLikes": "", "Comments":"", "UserData":{"FullName":""}};
  groupEdit = {"GroupName":"","GroupType":2,"GroupTopic":"","IsPublic":true,"IsActive":true,"PhotoLocation":"", "Description":""};
  forums = [];
  lastForum: any;
  hasForums: boolean = false;
  groupNotifications = [];
  lastGroupNotification: any;
  hasGroupNotifications: boolean = false;
  groupID: number = 0;
  activeMember: boolean = false;
  groupAdmin: boolean = false;
  moreDetail: boolean = false;
  moreDetailArrow: string = "arrow-dropdown-circle";
  errorMessage: string;
  infiniteScroll: any;
  formOptions = {"Mode":"EDIT","Title":""};
  groupIsPublic: string = "BTN_No";
  groupIsActive: string = "BTN_No";
  forumIsPublic: string = "BTN_No";
  sheetLabels: any = {};

  constructor(private router: Router, private zone: NgZone, private rest: DataServiceService, private translate: TranslateService, 
		private popTools: PopTools, private popRoutes: PopRoutes) { 

  }

  ngOnInit() {
    this.translate.stream(['Group_Options','All_SocialOptions','Forum_Options', 'Group_Members','Social_ViewPhotos','Social_View_Videos',
			'Social_View_Document','Social_CommentView','Group_AddNews','Group_SuggestMem','Group_Join','Group_Like','All_ViewCalendar',
			'Message_ViewNotes','Group_ForumView','Group_ForumNew','All_BTN_Cancel','Calendar_Loading','All_Wait','Al_SystemError',
			'Group_Edit','Update_Message','Social_Pictures','Group_ForumName','All_Description','Login_Submit','Group_ForumCreateOK',
			'Group_JoinConfirm','Member_NoteSend','Group_NoteSend','Message_Send','All_Sow_Likes','Social_LikeSet','errManInvalidAccess',
			'Social_AlreadyLiked','All_Item_Not_Found','All_AccessDenied','All_CannotContinue','All_Like','All_DontLike','All_GroupNews_Like',
			'Group_News']).subscribe(res => {
      this.sheetLabels = res;
    });    
  }

  ionViewDidEnter() {
    let myParams = this.popRoutes.getCurrentParam();
    if (myParams.groupID) {
      this.forums = [];
      this.groupNotifications = [];
      this.groupID = myParams.groupID;
      this.getGroup();
    }
  }

  goBack() {
    this.popRoutes.navigateBackwards();
  }
  
  getGroup() {
    this.rest.getGroup(this.groupID)
      .subscribe(
        group => this.parsGroup(group[0]),
        error =>  this.errorMessage = <any>error);
  }
  
  parsGroup(group) {
    if (group.ActiveMember == 1) {this.activeMember = true;}
    if (group.GroupAdmin == 1) {this.groupAdmin = true;}
    if (group.IsPublic == 1) {this.groupIsPublic = "BTN_Yes";} else {this.groupIsPublic = "BTN_No";}
    if (group.IsActive == 1) {this.groupIsActive = "BTN_Yes";} else {this.groupIsActive = "BTN_No";}
    switch(group.UserType) {
      case 1:
        group.Condition = "Member_Administrator";
        break;
      case 2:
        group.Condition = "Member_SubAdmin";
        break;
      case 3:
        group.Condition = "Member_Moderator";
        break;
      case 4:
        group.Condition = "Member_User";
        break;
    }
    switch(group.MemberLevel) {
      case 1:
        group.Condition = "MemberL_Novice";
        break;
      case 2:
        group.Condition = "MemberL_Beginner";
        break;
      case 3:
        group.Condition = "MemberL_Intermediate";
        break;
      case 4:
        group.Condition = "MemberL_Expert";
        break;
      case 5:
        group.Condition = "MemberL_Guru";
        break;
    }

    this.group = group;
    this.getForums();
    this.getGroupNotifications();
  }

  getForums() {
    this.rest.getForums(this.groupID,null)
      .subscribe(
        forums => this.parsForums(forums),
        error =>  this.errorMessage = <any>error);
  }
  
  parsForums(forums) {
    this.forums = [];
    forums.forEach(forum => {
      if (!this.hasForums) {this.hasForums = true;}
        this.lastForum = forum.DateCreated;
        if (forum.IsPublic == 1) {this.forumIsPublic = "BTN_Yes";} else {this.forumIsPublic = "BTN_No";}
        this.forums.push(forum);
    });
  }

  getGroupNotifications() {
    this.rest.getGroupNotifications(this.groupID,null)
      .subscribe(
        groupnotifications => this.parsGroupNotifications(groupnotifications),
        error =>  this.errorMessage = <any>error);
  }
  
  parsGroupNotifications(groupnotifications) {
    groupnotifications.forEach(groupnotification => {
      if (!this.hasGroupNotifications) {this.hasGroupNotifications = true;}
      this.lastGroupNotification = groupnotification.DateSend;
      this.groupNotifications.push(groupnotification);
    });

    if (this.infiniteScroll) {
       this.infiniteScroll.target.complete();
    }
  }

  toggleMoreDetail() {
    if (this.moreDetail) {
      this.moreDetail = false;
      this.moreDetailArrow = "arrow-dropdown-circle";
    } else {
      this.moreDetail = true;
      this.moreDetailArrow = "arrow-dropup-circle";
    }
  }

  showPhoto() {
   var params = {"Location": this.group.PhotoLocation, "Description": this.group.Description, "Likes": this.group.Likes, "NLikes": this.group.NLikes, "Comments": this.group.Comments, "ShowComments": true, "ObjectType":"group", "ObjectID":this.groupID, "resourceType":1};

   this.popRoutes.navigateForward('/show-photo', params);
  }

  showForum(lngForumID, strForumName, strGroupAdmin, strActiveMember, lngAccessType) {
   let params = { forumID: lngForumID, groupID: this.groupID, forumName: strForumName, groupName: this.group.GroupName, forumAccess: lngAccessType, groupAdmin: strGroupAdmin, activeMember: strActiveMember};

   this.zone.run(async () => {
     await this.popRoutes.navigateForward('/forum', params);
   });	
  }

  showResource(strResourcePage,resourceIndex) {
   let params = { GroupID: this.groupID, resourceIndex: resourceIndex, Fullname: this.group.GroupName };

   this.zone.run(async () => {
     await this.popRoutes.navigateForward(strResourcePage, params);
   });	
  }

  showMembers() {
   let params = { groupID: this.groupID, Fullname: this.group.GroupName };

   this.zone.run(async () => {
     await this.popRoutes.navigateForward('/group-members', params);
   });	
  }

  showProducts() {
   let params = { memberID: 0, groupID: this.groupID, Fullname: this.group.GroupName };

   this.zone.run(async () => {
     await this.popRoutes.navigateForward('/tabs/market', params);
   });	
  }

  showCalendar() {
   let params = { groupID: this.groupID, Fullname: this.group.GroupName };

   this.zone.run(async () => {
     await this.popRoutes.navigateForward('/group-calendar', params);
   });	
  }

  showNotes() {
   let params = { groupID: this.groupID };

   this.zone.run(async () => {
     await this.popRoutes.navigateForward('/notes', params);
   });	
  }

  showMember(lngMemberID) {
   let params = { memberID: lngMemberID, isFriend: null };

   this.zone.run(async () => {
     await this.popRoutes.navigateForward('/member-profile', params);
   });	
  }

  editGroup() {
   let postString = "";
   this.groupEdit.GroupName = this.group.GroupName;
   this.groupEdit.GroupType = this.group.GroupType;
   this.groupEdit.GroupTopic = this.group.GroupTopic;
   this.groupEdit.IsPublic = Boolean(this.group.IsPublic);
   this.groupEdit.IsActive = Boolean(this.group.IsActive);
   this.groupEdit.Description = this.group.Description;
   this.groupEdit.PhotoLocation = this.group.PhotoLocation;

   this.formOptions.Title = this.group.GroupName;
   let params = { "group": this.groupEdit, "options": this.formOptions };

   this.popRoutes.showModal("GroupEditPage", params, (data) => {
    if (data) {
      delete data.PhotoLocation;
      delete data.GroupName;
      if (data.GroupType == this.group.GroupType) {delete data.GroupType;}
      if (data.GroupTopic == this.group.GroupTopic) {delete data.GroupTopic;}
      if (data.Description == this.group.Description) {delete data.Description;}
      data.IsPublic = data.IsPublic ? 1 : 0;
      if (data.IsPublic == this.group.IsPublic) {delete data.IsPublic;}
      data.IsActive = data.IsActive ? 1 : 0;
      if (data.IsActive == this.group.IsActive) {delete data.IsActive;}
      for (var key in data) {
        if (postString != "") {postString = postString + "&";}
        postString = postString + key + "=" + data[key];
      }
      if (postString != "") {
        this.popTools.showLoading();
        this.rest.patchGroup(this.groupID,postString)
    	    .subscribe(
            response => this.parsResponse(response),
            error =>  this.errorNotification(error));
      }
    }
   });
  }

  editPhoto() {
   let postString = "";
   this.formOptions.Title = this.sheetLabels["Social_Pictures"];
   let params = { "resourceIndex": 1, "options": this.formOptions };

   this.popRoutes.showModal("SelectMyResourcePage", params, (data) => {
    if (data) {
      postString = "PhotoLocation=" + data.resourceLocation;
      this.popTools.showLoading();
      this.rest.patchGroup(this.groupID,postString)
    	  .subscribe(
          response => this.parsResponse(response),
          error =>  this.errorNotification(error));
    }
   });
  }

  parsResponse(response) {
    this.popTools.dismissLoading();
    if (response.rowsAffected[0]) {
      this.popTools.showToast(this.sheetLabels["Update_Message"], null);
      this.getGroup();
    } else {
      this.popTools.showAlert(this.sheetLabels["Al_SystemError"],JSON.stringify(response));
    }
  }

  errorNotification(error) {
    this.errorMessage = <any>error;

    this.popTools.dismissLoading();
    let jsonError = JSON.parse(error)
    if (this.infiniteScroll) {
       this.infiniteScroll.target.complete();
       this.infiniteScroll.target.disabled = true;
    }
    if (jsonError.code) {
      if (jsonError.code != "ITEM_NOT_FOUND") {this.popTools.showAlert(this.sheetLabels["Al_SystemError"],error);}
    } else {
      this.popTools.showAlert(this.sheetLabels["Al_SystemError"],error);
    }
  }

  doInfinite(infiniteScroll) {
    this.infiniteScroll = infiniteScroll;

    if (this.lastGroupNotification) {
      var lastDate = this.lastGroupNotification;

      this.lastGroupNotification = null;
      this.rest.getGroupNotifications(this.groupID,lastDate)
         .subscribe(
           groupnotifications => this.parsGroupNotifications(groupnotifications),
           error =>  this.endInfinite(error));
    } else {	
       infiniteScroll.target.complete();
       infiniteScroll.target.disabled = true;
    }
  }

  endInfinite(error) {
    this.errorMessage = <any>error;

    if (this.infiniteScroll) {
       this.infiniteScroll.target.complete();
       this.infiniteScroll.target.disabled = true;
    }
  }

  createNewForum(strForumName, strDescription) {
    let postString = "ForumName=" + strForumName + "&Description=" +strDescription;

    this.popTools.showLoading();
    this.rest.newForum(this.groupID,postString)
      .subscribe(
        response => this.parsNewResponse(response),
        error =>  this.errorNotification(error));
  }
  
  parsNewResponse(response) {
    this.popTools.dismissLoading();
    if (response.rowsAffected[0]) {
      this.popTools.showToast(this.sheetLabels["Group_ForumCreateOK"], null);
      this.getForums();
    } else {
      this.popTools.showAlert(this.sheetLabels["Al_SystemError"],JSON.stringify(response));
    }
  }

  requestGroupMembership(message) {
    this.popTools.showLoading();
    this.rest.postGroupRequestNotification(this.groupID,message)
      .subscribe(
        response => this.parsMembershipResponse(this.sheetLabels["Group_NoteSend"], response),
        error =>  this.parsMembershipError(error));    
  }

  suggestGroupMembership() {
   let params = { "friend": 0, "options": {"Mode":"ADD", "Title":this.sheetLabels["Group_SuggestMem"], "SowMessageBox":true} };

   this.popRoutes.showModal("SelectFriendsPage", params, (data) => {
    if (data) {
      this.popTools.showLoading();
      this.rest.postGroupSuggestNotification(this.groupID,data.friendID,data.message)
      .subscribe(
        response => this.parsMembershipResponse(this.sheetLabels["Member_NoteSend"], response),
        error =>  this.parsMembershipError(error));
    }
   });
  }

  parsMembershipResponse(message, response) {
    this.popTools.dismissLoading();
    if (response.rowsAffected) {
      this.popTools.showToast(message, response.PhotoLocation);
    } else {
      this.popTools.showAlert(this.sheetLabels["Al_SystemError"],JSON.stringify(response));
    }
  }

  async showGroupLikePrompt() {
    this.popTools.showAddLikePrompt(this.sheetLabels["Group_Like"], (data) => {
      if (data == 3) {
        this.showGroupLikes();
      } else if (data > 0) {
        this.sendGroupLike(data)
      }
    });
  }

  showGroupLikes() {
    let params = { ObjectType:"group", ObjectID: this.groupID, Title: this.group.GroupName };
    this.popTools.showLikes(params, (data2) => {
      if (data2 > 0) {this.showMember(data2);}
    });
  }

  sendGroupLike(like) {
    this.popTools.showLoading();
    this.rest.postLike("group", this.groupID, like)
      .subscribe(
        response => this.parsGroupLikeResponse(response, like),
        error =>  this.parsPostError(error));
  }

  parsGroupLikeResponse(response, like) {
    this.popTools.dismissLoading();
    if (response.rowsAffected[0]) {
      if (like == 1) {
        this.group.Likes = this.group.Likes + 1;
      } else {
        this.group.NLikes = this.group.NLikes + 1;
      }

      this.popTools.showToast(this.sheetLabels["Social_LikeSet"], null);
    } else {
      this.errorNotification(response);
    }
  }

  showObject(lngIndex) {
    var params = {};
    var strLocation = null;
    var ObjectData = this.groupNotifications[lngIndex];

    if (ObjectData.GroupData) {strLocation = ObjectData.GroupData["Location"];}
    params = {"ObjectType": "grouppost", "ObjectID": ObjectData["ID"], Location: strLocation, 
		Description: ObjectData["Contents"], "Likes": ObjectData["Likes"], "NLikes": ObjectData["NLikes"], 
		"Comments": ObjectData["Comments"], NoIcons: null, ShowComments: true, "resourceType": ObjectData["ObjectType"]};

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

    switch(strObject) {
      case "Likes":
        lngCount = Number(this.groupNotifications[lngIndex].Likes) + lngValue;
        this.groupNotifications[lngIndex].Likes = lngCount
        break;
      case "NLikes":
        lngCount = Number(this.groupNotifications[lngIndex].NLikes) + lngValue;
        this.groupNotifications[lngIndex].NLikes = lngCount
        break;
      case "Comments":
        lngCount = Number(this.groupNotifications[lngIndex].Comments) + lngValue;
        this.groupNotifications[lngIndex].Comments = lngCount
        break;
    }
  }
  
  async showAddLikePrompt(lngIndex) {
    this.popTools.showAddLikePrompt(this.sheetLabels["All_GroupNews_Like"], (data) => {
      if (data == 3) {
        var strTitle = this.sheetLabels["Group_News"];
        var params = { ObjectType:"grouppost", ObjectID: this.groupNotifications[lngIndex].ID, Title: strTitle };
        this.popTools.showLikes(params, (data2) => {
          if (data2 > 0) {this.showMember(data2);}
        });
      } else if (data > 0) {
        this.sendLike(lngIndex,data)
      }
    });
  }

  sendLike(lngIndex,like) {
    this.popTools.showLoading();
    this.rest.postLike("grouppost", this.groupNotifications[lngIndex].ID, like)
      .subscribe(
        response => this.parsLikeResponse(response, lngIndex, like),
        error =>  this.parsPostError(error));
  }

  parsLikeResponse(response,lngIndex,like) {
    var lngCount = 0; var strLocation = null;

    if (response.rowsAffected[0]) {
      if (like == 1) {
        lngCount = Number(this.groupNotifications[lngIndex].Likes) + 1;
        this.groupNotifications[lngIndex].Likes = lngCount;
      } else {
        lngCount = Number(this.groupNotifications[lngIndex].NLikes) + 1;
        this.groupNotifications[lngIndex].NLikes = lngCount;
      }

      if (this.groupNotifications[lngIndex].GroupData) {
        if (this.groupNotifications[lngIndex].ObjectType == 1) {
          strLocation = this.groupNotifications[lngIndex].GroupData.Location;
        }
      }
      this.popTools.showToast(this.sheetLabels["Social_LikeSet"],strLocation);
    } else {
      this.errorNotification(response);
    }
  }

  parsPostError(error: any) {
    var strMessage = ""; var objError = {};

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

  parsMembershipError(error: any) {
    var strMessage = ""; var objError = {};

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

  showGroupRequestPrompt() {
      let inputs = [
        {
          name: 'message',
          placeholder: this.sheetLabels["All_Message"]
        },
      ];
      let buttons = [
        {
          text: this.sheetLabels["All_BTN_Cancel"],
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: this.sheetLabels["Message_Send"],
          handler: data => {
            this.requestGroupMembership(data.message);
          }
        }
      ];

    this.popTools.showAlertList(this.sheetLabels["Group_Join"], this.sheetLabels["Group_JoinConfirm"], inputs, buttons);
  }
  
  showNewForumPrompt() {
      let inputs = [
        {
          name: 'forumname',
          placeholder: this.sheetLabels["Group_ForumName"]
        },
        {
          name: 'description',
          placeholder: this.sheetLabels["All_Description"]
        },
      ];
      let buttons = [
        {
          text: this.sheetLabels["All_BTN_Cancel"],
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: this.sheetLabels["Login_Submit"],
          handler: data => {
            this.createNewForum(data.forumname, data.description);
          }
        }
      ];

    this.popTools.showAlertList(this.sheetLabels["Group_ForumNew"], null, inputs, buttons);
  }

  presentGroupActionSheet() {
   let buttons = [];
   buttons.push({
           text: this.sheetLabels["Group_Members"],
           handler: () => {
             this.showMembers();
           }
   });
   if (this.groupAdmin) {
      buttons.push({
           text: this.sheetLabels["Group_AddNews"],
           handler: () => {
             this.emptyMethod();
           }
      });
   }
   if (this.groupAdmin) {
      buttons.push({
           text: this.sheetLabels["Group_SuggestMem"],
           handler: () => {
             this.suggestGroupMembership();
           }
      });
   } else if (!this.activeMember) {
      buttons.push({
           text: this.sheetLabels["Group_Join"],
           handler: () => {
             this.showGroupRequestPrompt();
           }
      });
   }
   buttons.push({
           text: this.sheetLabels["Group_Like"],
           handler: () => {
             this.showGroupLikePrompt();
           }
   });
   buttons.push({
           text: this.sheetLabels["All_Sow_Likes"],
           handler: () => {
             this.showGroupLikes();
           }
   });
   buttons.push({
           text: this.sheetLabels["Social_CommentView"],
           handler: () => {
             this.showPhoto();
           }
   });
   buttons.push({
           text: this.sheetLabels["All_BTN_Cancel"],
           role: 'cancel',
           handler: () => { }
   });

   this.popTools.showActionSheet(this.sheetLabels["Group_Options"], buttons);
  }
  
  presentSocialActionSheet() {
     let buttons = [
       {
         text: this.sheetLabels["Social_ViewPhotos"],
         handler: () => {
           this.showResource("/group-resources",1);
         }
       },
       {
         text: this.sheetLabels["Social_View_Videos"],
         handler: () => {
           this.showResource("/group-resources",2);
         }
       },
       {
         text: this.sheetLabels["Social_View_Document"],
         handler: () => {
           this.showResource("/group-resources",3);
         }
       },
       {
         text: this.sheetLabels["All_ViewCalendar"],
         handler: () => {
           this.showCalendar();
         }
       },
       {
         text: this.sheetLabels["Message_ViewNotes"],
         handler: () => {
           this.showNotes();
         }
       },
       {
         text: this.sheetLabels["All_BTN_Cancel"],
         role: 'cancel',
         handler: () => { }
       }
     ];

   this.popTools.showActionSheet(this.sheetLabels["All_SocialOptions"], buttons);
  }

  presentForumActionSheet() {
   let buttons = [];
   buttons.push({
           text: this.sheetLabels["Group_ForumView"],
           handler: () => {
             this.emptyMethod();
           }
   });
   if (this.groupAdmin) {
      buttons.push({
           text: this.sheetLabels["Group_ForumNew"],
           handler: () => {
             this.showNewForumPrompt();
           }
      });
   }
   buttons.push({
           text: this.sheetLabels["All_BTN_Cancel"],
           role: 'cancel',
           handler: () => { }
   });

   this.popTools.showActionSheet(this.sheetLabels["Forum_Options"], buttons);
  }

  emptyMethod() {

  }

}
