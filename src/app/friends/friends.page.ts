import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { DataServiceService } from './../data-service.service';
import { TranslateService } from '@ngx-translate/core';
import { PopTools } from './../pop-tools';
import { PopRoutes } from './../pop-routes';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.page.html',
  styleUrls: ['./friends.page.scss'],
})
export class FriendsPage implements OnInit {
  friends = [];
  lastFriend: any;
  memberID: number;
  memberFullname: string;
  pageTitle: string;
  infiniteScroll: any;
  BlockDisconnect: string;
  parentCaller = "/tabs/my-portal";
  sheetLabels: any = {};
  errorMessage: string;

  constructor(private router: Router, private rest: DataServiceService, private translate: TranslateService, 
    private popTools: PopTools, private popRoutes: PopRoutes) { 

  }

  ngOnInit() {
  }

  goBack() {
    this.popRoutes.navigateBackwards();
  }

  ionViewDidEnter() {
    let myParams = this.popRoutes.getCurrentParam();

    this.friends = [];
    this.memberID = 0;
    this.memberFullname = "";
    if (myParams) {
      if (myParams.memberID) {this.memberID = myParams.memberID;}    
      if (myParams["parent"]) {this.parentCaller = myParams["parent"];}
    }
      
    this.getFriends();
    this.translate.stream(['Chat_Chat','Main_Friends','Group_ForumToSmall','Social_MemberOptions','Social_MemberProfile', 
			'All_WatchFriend','Social_MemberRemove','Social_MemberBlock','BlockDisconnect','Social_MemberLike',
			'Social_CommentView','All_BTN_Cancel','All_BTN_OK','BlockDisconnect1','BlockDisconnect2',
			'BlockDisconnect3','BlockDisconnect4','BlockDisconnect5','All_CannotContinue',
			'Member_GuestPortal','errManInvalidAccess','All_AccessDenied','All_Item_Not_Found','Social_AlreadyLiked',
			'All_Like','All_DontLike','All_Sow_Likes','Social_LikeSet']).subscribe(res => {

      this.sheetLabels = res;
      this.BlockDisconnect = res.BlockDisconnect1 + " " + res.BlockDisconnect2 + " " + res.BlockDisconnect3 + " " + res.BlockDisconnect4 + " " + res.BlockDisconnect5;

      if (myParams) {
        if (myParams.Fullname) {
	        this.memberFullname = myParams.Fullname;
          this.pageTitle = this.sheetLabels["Main_Friends"] + " " + this.sheetLabels["Group_ForumToSmall"] + " " + this.memberFullname;
        } else {
	        this.pageTitle = this.sheetLabels["Main_Friends"];
        }
      } else {
        this.pageTitle = this.sheetLabels["Main_Friends"];
      }
    });
  }

  getFriends() {
    this.rest.getFriends(this.memberID,null)
       .subscribe(
         friends => this.parsFriends(friends),
         error =>  this.errorMessage = <any>error);
  }

  parsFriends(friends) {
    friends.forEach(friend => {
	      this.lastFriend = friend.FriendSince;
        this.friends.push(friend);
    });
  }

  showMember(lngMemberID) {
   let params = { memberID: lngMemberID, isFriend: true };
   
   this.popRoutes.navigateForward('/member-profile', params);
  }

  showChatMessages(lngFriendID, index) {

   let params = { friendID: lngFriendID, fullName: this.friends[index].FullName, PhotoLocation: this.friends[index].PhotoLocation, Unread: this.friends[index].StatData.ChatUnread };
   this.popRoutes.navigateForward('/chat-room', params);
  }

  showFriendMessages(lngFriendID, index) {
   let params = { friendID: lngFriendID, friendFullname: this.friends[index].FullName };

   this.popRoutes.navigateForward('/messenger', params);
  }

  showObject(lngIndex) {
    var ObjectData = this.friends[lngIndex];
    var params = {"ObjectType": "member", "ObjectID": ObjectData["FriendID"], Location: ObjectData["PhotoLocation"], 
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
	      lngCount = Number(this.friends[lngIndex].Likes) + lngValue;
	      this.friends[lngIndex].Likes = lngCount
	      break;
      case "NLikes":
	      lngCount = Number(this.friends[lngIndex].NLikes) + lngValue;
	      this.friends[lngIndex].NLikes = lngCount
	      break;
      case "Comments":
	      lngCount = Number(this.friends[lngIndex].Comments) + lngValue;
	      this.friends[lngIndex].Comments = lngCount
	      break;
    }
  }
  
  async showAddLikePrompt(lngIndex) {
    this.popTools.showAddLikePrompt(this.sheetLabels["Social_MemberLike"], (data) => {
      if (data == 3) {
        var strTitle = this.sheetLabels["Member_GuestPortal"] + " " + this.friends[lngIndex].FullName;
        var params = { ObjectType:"member", ObjectID: this.friends[lngIndex].FriendID, Title: strTitle };
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
    this.rest.postLike("member", this.friends[lngIndex].FriendID, like)
      .subscribe(
        response => this.parsLikeResponse(response, lngIndex, like),
        error =>  this.popTools.parsPostError(error));
  }

  parsLikeResponse(response,lngIndex,like) {
    var lngCount = 0;

    if (response.rowsAffected[0]) {
      if (like == 1) {
	      lngCount = Number(this.friends[lngIndex].Likes) + 1;
	      this.friends[lngIndex].Likes = lngCount;
      } else {
	      lngCount = Number(this.friends[lngIndex].NLikes) + 1;
	      this.friends[lngIndex].NLikes = lngCount;
      }

      this.popTools.dismissLoading();
      this.popTools.showToast(this.sheetLabels["Social_LikeSet"],this.friends[lngIndex].PhotoLocation);
    } else {
      this.errorParser(response);
    }
  }

  presentActionSheet(memberID, index) {
   let buttons = [];
   buttons.push({
           text: this.sheetLabels["Social_MemberProfile"],
           icon: 'eye',
           handler: () => {
             this.showMember(memberID);
           }
   });
   if (this.memberID == 0) {
      buttons.push({
           text: this.sheetLabels["Chat_Chat"],
           icon: 'chatboxes',
           handler: () => {
             this.showChatMessages(memberID, index);
           }
      });
   }
   buttons.push({
           text: this.sheetLabels["All_WatchFriend"],
           icon: 'videocam',
           handler: () => {
             this.emptyMethod();
           }
   });
   buttons.push({
           text: this.sheetLabels["Social_MemberRemove"],
           icon: 'close-circle',
           handler: () => {
             this.emptyMethod();
           }
   });
   buttons.push({
           text: this.sheetLabels["Social_MemberBlock"],
           icon: 'hand',
           handler: () => {
             this.emptyMethod();
           }
   });
   buttons.push({
           text: this.sheetLabels["BlockDisconnect"],
           icon: 'paper',
           handler: () => {
             this.showMessage();
           }
   });
   buttons.push({
           text: this.sheetLabels["Social_MemberLike"],
           icon: 'happy',
           handler: () => {
             this.showAddLikePrompt(index);
           }
   });
   buttons.push({
           text: this.sheetLabels["Social_CommentView"],
           icon: 'text',
           handler: () => {
             this.showObject(index);
           }
   });
   buttons.push({
           text: this.sheetLabels["All_BTN_Cancel"],
           icon: 'close',
           role: 'cancel',
           handler: () => { }
   });

   this.popTools.showActionSheet(this.sheetLabels["Social_MemberOptions"], buttons);   
  }

  showMessage() {
      let buttons = [
        {
          text: this.sheetLabels["All_BTN_OK"],
          role: 'cancel',
          handler: (blah) => {
            console.log('Cancel clicked');
          }
        }
      ]

    this.popTools.showAlertList(this.sheetLabels["BlockDisconnect"], this.BlockDisconnect, null, buttons);
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

    if (this.lastFriend) {
      var lastDate = this.lastFriend;

      this.lastFriend = null;
      this.rest.getFriends(this.memberID,lastDate)
         .subscribe(
           friends => this.parsFriends(friends),
           error =>  this.errorMessage = error);	
    }
  }
  
  emptyMethod() {

  }

  getItems(ev: any) {

  }

}
