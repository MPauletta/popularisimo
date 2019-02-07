import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { DataServiceService } from './../data-service.service';
import { TranslateService } from '@ngx-translate/core';
import { PopTools } from './../pop-tools';
import { PopRoutes } from './../pop-routes';

@Component({
  selector: 'app-members',
  templateUrl: './members.page.html',
  styleUrls: ['./members.page.scss'],
})
export class MembersPage implements OnInit {
  members = [];
  lastMember: any;
  parentCaller = "/tabs/my-portal";
  errorMessage: string;
  infiniteScroll: any;
  sheetLabels: any = {};

  constructor(private router: Router, private rest: DataServiceService, private translate: TranslateService, 
    private popTools: PopTools, private popRoutes: PopRoutes) { 

  }

  ngOnInit() {
    this.getMembers();
    this.translate.stream(['Social_MemberOptions','Social_MemberProfile', 'Social_MemberConnect',
			'Social_CommentView','All_BTN_Cancel','Member_Connect','Member_ConnectLong','Message_Send',
			'All_Message','Member_NoteSend','Al_SystemError','Member_NotSendToSelf','Member_AlreadyFriend',
			'Member_AlreadySend','errSecUsernameNotFound','All_CannotContinue',
			'Member_GuestPortal','errManInvalidAccess','All_AccessDenied','All_Item_Not_Found','Social_AlreadyLiked',
			'Social_MemberLike','All_Like','All_DontLike','All_Sow_Likes','Social_LikeSet']).subscribe(res => {
      this.sheetLabels = res;
    });
  }

  goBack() {
    this.popRoutes.navigateBackwards();
  }

  getMembers() {
    this.rest.getMembers(null)
       .subscribe(
         members => this.parsMembers(members),
         error =>  this.errorMessage = <any>error);
  }

  parsMembers(members) {
    members.forEach(member => {
	      this.lastMember = member.DateCreated;
        this.members.push(member);
    });

    if (this.infiniteScroll) {
       this.infiniteScroll.target.complete();
    }
  }

  showMember(lngMemberID, lngIndex) {
   let params = { memberID: lngMemberID, isFriend: false };

   if (lngIndex == null) {
     params.isFriend = null;
   } else if (this.members[lngIndex].IsFriend == 1) {
     params.isFriend = true;
   }

   this.popRoutes.navigateForward('/member-profile', params);
  }

  async presentActionSheet(memberID, lngIndex) {
    let buttons = [{
      text: this.sheetLabels["Social_MemberProfile"],
      icon: 'eye',
      handler: () => {
        this.showMember(memberID, lngIndex);
      }
    }, {
      text: this.sheetLabels["Social_MemberConnect"],
      icon: 'contacts',
      handler: () => {
        this.showMemberConnectPrompt(memberID);
      }
    }, {
      text: this.sheetLabels["Social_MemberLike"],
      icon: 'happy',
      handler: () => {
        this.showAddLikePrompt(lngIndex);
      }
    }, {
      text: this.sheetLabels["Social_CommentView"],
      icon: 'text',
      handler: () => {
        this.showObject(lngIndex);
      }
    }, {
      text: this.sheetLabels.All_BTN_Cancel,
      icon: 'close',
      role: 'cancel',
      handler: () => {
        console.log('Cancel clicked');
      }
    }];
   
   this.popTools.showActionSheet(this.sheetLabels["Social_MemberOptions"], buttons);   
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

  connectMember(memberID,message) {
    this.popTools.showLoading();
    this.rest.postFriendRequestNotification(memberID,message)
       .subscribe(
         result => this.parsConnectResult(result),
         error =>  this.parsConnectError(error));
  }

  async showMemberConnectPrompt(memberID) {
    let inputs = [
        {
          name: 'message',
          type: 'text',
          placeholder: this.sheetLabels["All_Message"]
        },
      ];
    let buttons = [
        {
          text: this.sheetLabels["Message_Send"],
          handler: (data) => {
            this.connectMember(memberID, data["message"]);
          }
        }, {
          text: this.sheetLabels["All_BTN_Cancel"],
          role: 'cancel',
          handler: (blah) => {
            console.log('Cancel clicked');
          }
        }
      ];
    
    this.popTools.showAlertList(this.sheetLabels["Member_Connect"], this.sheetLabels["Member_ConnectLong"], inputs, buttons);    
  }

  showObject(lngIndex) {
    var ObjectData = this.members[lngIndex];
    var params = {"ObjectType": "member", "ObjectID": ObjectData["UserID"], Location: ObjectData["PhotoLocation"], 
		Description: ObjectData["FullName"], "Likes": ObjectData["Likes"], "NLikes": ObjectData["NLikes"], 
		"Comments": ObjectData["Comments"], NoIcons: null, ShowComments: true, "resourceType": 1};

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
	      lngCount = Number(this.members[lngIndex].Likes) + lngValue;
	      this.members[lngIndex].Likes = lngCount
	      break;
      case "NLikes":
	      lngCount = Number(this.members[lngIndex].NLikes) + lngValue;
	      this.members[lngIndex].NLikes = lngCount
	      break;
      case "Comments":
	      lngCount = Number(this.members[lngIndex].Comments) + lngValue;
	      this.members[lngIndex].Comments = lngCount
	      break;
    }
  }
  
  async showAddLikePrompt(lngIndex) {
    this.popTools.showAddLikePrompt(this.sheetLabels["Social_MemberLike"], (data) => {
      if (data == 3) {
        var strTitle = this.sheetLabels["Member_GuestPortal"] + " " + this.members[lngIndex].FullName;
        var params = { ObjectType:"member", ObjectID: this.members[lngIndex].UserID, Title: strTitle };    
        this.popTools.showLikes(params, (data2) => {
          if (data2 > 0) {this.showMember(data2, null);}
        });
      } else if (data > 0) {
        this.sendLike(lngIndex,data)
      }
    });
  }

  sendLike(lngIndex,like) {
    this.popTools.showLoading();
    this.rest.postLike("member", this.members[lngIndex].UserID, like)
      .subscribe(
        response => this.parsLikeResponse(response, lngIndex, like),
        error =>  this.popTools.parsPostError(error));
  }

  parsLikeResponse(response,lngIndex,like) {
    var lngCount = 0;

    if (response.rowsAffected[0]) {
      if (like == 1) {
	      lngCount = Number(this.members[lngIndex].Likes) + 1;
	      this.members[lngIndex].Likes = lngCount;
      } else {
	      lngCount = Number(this.members[lngIndex].NLikes) + 1;
	      this.members[lngIndex].NLikes = lngCount;
      }

      this.popTools.dismissLoading();
      this.popTools.showToast(this.sheetLabels["Social_LikeSet"],this.members[lngIndex].PhotoLocation);
    } else {
      this.errorParser(response);
    }
  }

  errorParser(error) {
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

    if (this.lastMember) {
      var lastDate = this.lastMember;

      this.lastMember = null;
      this.rest.getMembers(lastDate)
         .subscribe(
           members => this.parsMembers(members),
           error =>  this.errorMessage = error);	
    }
  }

  emptyMethod() {

  }

  getItems(ev: any) {

  }

}
