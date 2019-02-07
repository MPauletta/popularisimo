import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { DataServiceService } from './../data-service.service';
import { TranslateService } from '@ngx-translate/core';
import { PopTools } from './../pop-tools';
import { PopRoutes } from './../pop-routes';

@Component({
  selector: 'app-group-members',
  templateUrl: './group-members.page.html',
  styleUrls: ['./group-members.page.scss'],
})
export class GroupMembersPage implements OnInit {
  groupMembers = [];
  lastGroupMember: any;
  groupID: number = 0;
  groupFullname: string;
  pageTitle: string;
  infiniteScroll: any;
  errorMessage: string;
  parentCaller: string = "";
  sheetLabels: any = {};

  constructor(private router: Router, private rest: DataServiceService, private translate: TranslateService, private popTools: PopTools, private popRoutes: PopRoutes) { 

      this.translate.stream(['Main_Friends','Group_ForumToSmall','Social_MemberOptions','Social_MemberProfile', 'Social_MemberConnect',
			'Social_MemberLike','Social_CommentView','All_BTN_Cancel','All_CannotContinue',
			'Member_Connect','Member_ConnectLong','Message_Send',
			'All_Message','Member_NoteSend','Al_SystemError','Member_NotSendToSelf','Member_AlreadyFriend',
			'Member_AlreadySend','errSecUsernameNotFound',
			'Member_GuestPortal','errManInvalidAccess','All_AccessDenied','All_Item_Not_Found','Social_AlreadyLiked',
			'All_Like','All_DontLike','All_Sow_Likes','Social_LikeSet']).subscribe(res => {

      this.sheetLabels = res;
    });
  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    let myParams = this.popRoutes.getCurrentParam();
    if (myParams) {
      if (myParams["parent"]) {this.parentCaller = myParams["parent"];}
      if (myParams["groupID"]) {this.groupID = myParams["groupID"];}    
      if (myParams["Fullname"]) {
	      this.groupFullname = myParams["Fullname"];
        this.pageTitle = this.sheetLabels["Main_Friends"] + " " + this.sheetLabels["Group_ForumToSmall"] + " " + this.groupFullname;
      } else {
	      this.pageTitle = this.sheetLabels["Main_Friends"];
      }
    } else {
      this.pageTitle = this.sheetLabels["Main_Friends"];
    }
    
    if (this.groupID) {
      this.groupMembers = [];
      this.getGroupMembers();
    }
  }

  goBack() {
    this.popRoutes.navigateBackwards();
  }

  getGroupMembers() {
    this.rest.getGroupMembers(this.groupID,null)
       .subscribe(
         groupMembers => this.parsGroupMembers(groupMembers),
         error =>  this.errorMessage = <any>error);
  }

  parsGroupMembers(groupMembers) {
    groupMembers.forEach(groupMember => {
	    this.lastGroupMember = groupMember.MemberSince;
      this.groupMembers.push(groupMember);
    });
  }

  showMember(lngMemberID) {
   let params = { memberID: lngMemberID, isFriend: null };

   this.popRoutes.navigateForward('/member-profile', params);
  }

  connectMember(memberID,message) {
    this.popTools.showLoading();
    this.rest.postFriendRequestNotification(memberID,message)
       .subscribe(
         result => this.parsConnectResult(result),
         error =>  this.parsConnectError(error));
  }

  parsConnectResult(result: any) {
    this.popTools.dismissLoading();
    if (result.rowsAffected[0]) {
      this.popTools.showAlert(this.sheetLabels["Social_MemberConnect"],this.sheetLabels["Member_NoteSend"]);
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
	      case "REQUEST_ALREADY_SEND":
	        strMessage = this.sheetLabels["Member_AlreadySend"];
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

  showMemberConnectPrompt(memberID) {
    let inputs= [
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
            this.connectMember(memberID, data.message);
          }
        }
      ];
    this.popTools.showAlertList(this.sheetLabels["Member_Connect"], this.sheetLabels["Member_ConnectLong"], inputs, buttons);
  }

  showObject(lngIndex) {
    var ObjectData = this.groupMembers[lngIndex];
    var params = {"ObjectType": "member", "ObjectID": ObjectData["UserID"], Location: ObjectData.UserData["PhotoLocation"], 
		Description: ObjectData.UserData["FullName"], "Likes": ObjectData.UserData["Likes"], "NLikes": ObjectData.UserData["NLikes"], 
		"Comments": ObjectData.UserData["Comments"], NoIcons: null, ShowComments: true, "resourceType": 1};

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
	      lngCount = Number(this.groupMembers[lngIndex].UserData.Likes) + lngValue;
	      this.groupMembers[lngIndex].UserData.Likes = lngCount
	      break;
      case "NLikes":
	      lngCount = Number(this.groupMembers[lngIndex].UserData.NLikes) + lngValue;
	      this.groupMembers[lngIndex].UserData.NLikes = lngCount
	      break;
      case "Comments":
	      lngCount = Number(this.groupMembers[lngIndex].UserData.Comments) + lngValue;
	      this.groupMembers[lngIndex].UserData.Comments = lngCount
	      break;
    }
  }
  
  async showAddLikePrompt(lngIndex) {
      this.popTools.showAddLikePrompt(this.sheetLabels["Social_MemberLike"], (data) => {
        if (data == 3) {
          var strTitle = this.sheetLabels["Member_GuestPortal"] + " " + this.groupMembers[lngIndex].UserData.FullName;
          var params = { ObjectType:"member", ObjectID: this.groupMembers[lngIndex].UserID, Title: strTitle };
          this.popTools.showLikes(params, (data2) => {
            if (data2 > 0) {this.showMember(data2)}
          });
        } else if (data > 0) {
          this.sendLike(lngIndex, data)
        }  
      });
  }
  
  sendLike(lngIndex,like) {
    this.popTools.showLoading();
    this.rest.postLike("member", this.groupMembers[lngIndex].UserID, like)
      .subscribe(
        response => this.parsLikeResponse(response, lngIndex, like),
        error =>  this.popTools.parsPostError(error));
  }

  parsLikeResponse(response,lngIndex,like) {
    var lngCount = 0;

    this.popTools.dismissLoading();
    if (response.rowsAffected[0]) {
      if (like == 1) {
	      lngCount = Number(this.groupMembers[lngIndex].UserData.Likes) + 1;
	      this.groupMembers[lngIndex].UserData.Likes = lngCount;
      } else {
	      lngCount = Number(this.groupMembers[lngIndex].UserData.NLikes) + 1;
	      this.groupMembers[lngIndex].UserData.NLikes = lngCount;
      }

      this.popTools.showToast(this.sheetLabels["Social_LikeSet"],this.groupMembers[lngIndex].UserData.PhotoLocation);
    } else {
      this.errorParser(response);
    }
  }

  presentActionSheet(memberID, lngIndex) {
     let buttons= [
       {
         text: this.sheetLabels["Social_MemberProfile"],
         icon: 'contact',
         handler: () => {
           this.showMember(memberID);
         }
       },
       {
         text: this.sheetLabels["Social_MemberConnect"],
         icon: 'contacts',
         handler: () => {
           this.showMemberConnectPrompt(memberID);
         }
       },
       {
         text: this.sheetLabels["Social_MemberLike"],
         icon: 'happy',
         handler: () => {
           this.showAddLikePrompt(lngIndex);
         }
       },
       {
         text: this.sheetLabels["Social_CommentView"],
         icon: 'paper',
         handler: () => {
           this.showObject(lngIndex);
         }
       },
       {
         text: this.sheetLabels["All_BTN_Cancel"],
         icon: 'close',
         role: 'cancel',
         handler: () => { }
       }
     ]

    this.popTools.showActionSheet(this.sheetLabels["Social_MemberOptions"], buttons);
  }

  errorParser(error) {
    this.errorMessage = <any>error;

    if (this.infiniteScroll) {
       this.infiniteScroll.target.complete();
       this.infiniteScroll.target.disabled = true;
    }
  }

  doInfinite(infiniteScroll) {
    this.infiniteScroll = infiniteScroll;

    if (this.lastGroupMember) {
      var lastDate = this.lastGroupMember;

      this.lastGroupMember = null;
      this.rest.getGroupMembers(this.groupID,lastDate)
         .subscribe(
           groupMembers => this.parsGroupMembers(groupMembers),
           error =>  this.errorParser(error));	
    }
  }
  
  emptyMethod() {

  }

  getItems(ev: any) {

  }

}
