import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { UserDataService } from './../user-data.service';
import { DataServiceService } from './../data-service.service';
import { TranslateService } from '@ngx-translate/core';
import { PopTools } from './../pop-tools';
import { PopRoutes } from './../pop-routes';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.page.html',
  styleUrls: ['./groups.page.scss'],
})
export class GroupsPage implements OnInit {
  groups = [];
  lastGroup: any;
  memberID: number;
  memberFullname: string;
  currentUserID: number = 0;
  pageTitle: string;
  infiniteScroll: any;
  errorMessage: string;
  formOptions = {"Mode":"ADD","Title":""};
  group = {"GroupName":"","GroupType":2,"GroupTopic":"","IsPublic":true,"IsActive":true,"PhotoLocation":"../../assets/imgs/G_earth.png", "Description":""};
  sheetLabels: any = {};

    constructor(private router: Router, private UserData: UserDataService, private rest: DataServiceService, 
        private translate: TranslateService, private popTools: PopTools, private popRoutes: PopRoutes) { 
  
    }
  
  ngOnInit() {
    let myParams = this.popRoutes.getCurrentParam();

    this.groups = [];
    this.memberID = 0;
    this.memberFullname = "";
    if (myParams) {
      if (myParams.memberID) {this.memberID = myParams.memberID;}    
      if (myParams.Fullname) {
	      this.memberFullname = myParams.Fullname;
        this.pageTitle = ": " + this.memberFullname;
      } else {
        this.pageTitle = "";
      }
    } else {
      this.pageTitle = "";  
    }

    if (this.UserData.currentUser) {
	    this.currentUserID = this.UserData.currentUser.user_id;
    } else {
	    this.getUserData();
    }
    this.getGroups();
    this.translate.stream(['Main_Groups','Main_My_Groups','Group_ForumToSmall','Group_Options','Group_View', 'Group_Members',
			'Group_Join','Group_Like','Social_CommentView','All_BTN_Cancel','All_Wait','Al_SystemError',
			'All_NewGroup','Group_CreateSuccess','All_Group',
			'All_CannotContinue','errManInvalidAccess','All_AccessDenied','All_Item_Not_Found','Social_AlreadyLiked',
			'Social_MemberLike','All_Like','All_DontLike','All_Sow_Likes','Social_LikeSet']).subscribe(res => {
      this.sheetLabels = res;
    });
  }

  goBack() {
    this.popRoutes.navigateBackwards();
  }

  getUserData() {
    this.UserData.getUserInfo().subscribe(user => {
      if (user) {
	      this.currentUserID = user.user_id;
      }
    });
  }

  getGroups() {
    if (this.memberFullname.length > 0) {
       this.pageTitle = ": " + this.memberFullname;
    } else {
       this.pageTitle = "";
    }
    this.rest.getGroups(this.memberID,null)
       .subscribe(
         groups => this.parsGroups(groups),
         error =>  this.errorMessage = <any>error);
  }

  getMyGroups() {
    this.pageTitle = ": " + this.sheetLabels["Main_My_Groups"];
    this.rest.getGroups(this.currentUserID,null)
       .subscribe(
         groups => this.parsGroups(groups),
         error =>  this.errorMessage = <any>error);
  }

  parsGroups(groups) {
    this.groups = [];
    groups.forEach(group => {
	    this.lastGroup = group.DateCreated;
      this.groups.push(group);
    });

    if (this.infiniteScroll) {
      this.infiniteScroll.target.complete();
    }
  }

  async newGroup() {
    let postString = "";
    let params = { "group": this.group, "options": this.formOptions };
    
    this.formOptions.Title = this.sheetLabels["All_NewGroup"];
    this.popRoutes.showModal("GroupEditPage", params, (data) => {
      if (data) {
	      delete data["PhotoLocation"]
	      data["IsPublic"] = data["IsPublic"] ? 1 : 0;
	      data["IsActive"] = data["IsActive"] ? 1 : 0;
	      for (var key in data) {
	        if (postString != "") {postString = postString + "&";}
	        postString = postString + key + "=" + data[key];
        }
      
	      this.popTools.showLoading();      
	      this.rest.newGroup(postString)
    	    .subscribe(
	          response => this.parsResponse(response),
	          error =>  this.errorParser(error));
      }
    });        
  }

  parsResponse(response) {
    this.popTools.dismissLoading();
    if (response.rowsAffected[0]) {
      this.popTools.showToast(this.sheetLabels["All_NewGroup"],this.sheetLabels["Group_CreateSuccess"]);
      this.getGroups();
    } else {
      this.popTools.showAlert(this.sheetLabels["Al_SystemError"],JSON.stringify(response));
    }
  }

  showGroup(lngGroupID) {
   let params = { groupID: lngGroupID };

   this.popRoutes.navigateForward('/group-details', params);
  }

  showMembers(lngGroupID,groupName) {
   let params = { groupID: lngGroupID, Fullname: groupName };

   this.popRoutes.navigateForward('/group-members', params);
  }

  showMember(lngMemberID) {
   let params = { memberID: lngMemberID, isFriend: null };

   this.popRoutes.navigateForward('/member-profile', params);
  }

  showObject(lngIndex) {
    var ObjectData = this.groups[lngIndex];
    var params = {"ObjectType": "group", "ObjectID": ObjectData["ID"], "Location": ObjectData["PhotoLocation"], 
		    "Description": ObjectData["GroupName"], "Likes": ObjectData["Likes"], "NLikes": ObjectData["NLikes"], 
		    "Comments": ObjectData["Comments"], "NoIcons": null, "ShowComments": true, "resourceType": 1};

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
	      lngCount = Number(this.groups[lngIndex].Likes) + lngValue;
	      this.groups[lngIndex].Likes = lngCount
	      break;
      case "NLikes":
	      lngCount = Number(this.groups[lngIndex].NLikes) + lngValue;
	      this.groups[lngIndex].NLikes = lngCount
	      break;
      case "Comments":
	      lngCount = Number(this.groups[lngIndex].Comments) + lngValue;
	      this.groups[lngIndex].Comments = lngCount
	      break;
    }
  }
  
  async showAddLikePrompt(lngIndex) {
    this.popTools.showAddLikePrompt(this.sheetLabels["Group_Like"], (data) => {
      if (data == 3) {
        var strTitle = this.sheetLabels["All_Group"] + " " + this.groups[lngIndex].GroupName;
        var params = { ObjectType:"group", ObjectID: this.groups[lngIndex].ID, Title: strTitle };
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
    this.rest.postLike("group", this.groups[lngIndex].ID, like)
      .subscribe(
        response => this.parsLikeResponse(response, lngIndex, like),
        error =>  this.popTools.parsPostError(error));
  }

  parsLikeResponse(response,lngIndex,like) {
    var lngCount = 0;

    if (response.rowsAffected[0]) {
      if (like == 1) {
	      lngCount = Number(this.groups[lngIndex].Likes) + 1;
	      this.groups[lngIndex].Likes = lngCount;
      } else {
	      lngCount = Number(this.groups[lngIndex].NLikes) + 1;
	      this.groups[lngIndex].NLikes = lngCount;
      }
      this.popTools.dismissLoading();
      this.popTools.showToast(this.sheetLabels["Social_LikeSet"],this.groups[lngIndex].PhotoLocation);
    } else {
      this.errorParser(response);
    }
  }

  async presentActionSheet(groupID, groupName, lngIndex) {
    let buttons = [{
      text: this.sheetLabels["Group_View"],
      icon: 'eye',
      handler: () => {
        this.showGroup(groupID);
      }
    }, {
      text: this.sheetLabels["Group_Members"],
      icon: 'contacts',
      handler: () => {
        this.showMembers(groupID,groupName);
      }
    }, {
      text: this.sheetLabels["Group_Like"],
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
      text: this.sheetLabels["All_BTN_Cancel"],
      icon: 'close',
      role: 'cancel',
      handler: () => {
        console.log('Cancel clicked');
      }
    }];

   this.popTools.showActionSheet(this.sheetLabels["Group_Options"], buttons);
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

    if (this.lastGroup) {
      var lastDate = this.lastGroup;

      this.lastGroup = null;
      this.rest.getGroups(this.memberID,lastDate)
         .subscribe(
           groups => this.parsGroups(groups),
           error =>  this.stopInfinite(error));	
    }
  }

  stopInfinite(error) {
	this.errorMessage = error
  
    if (this.infiniteScroll) {
       this.infiniteScroll.target.complete();
       this.infiniteScroll.target.disabled = true;
    }
  }

  emptyMethod() {

  }

  getItems(ev: any) {

  }

}
