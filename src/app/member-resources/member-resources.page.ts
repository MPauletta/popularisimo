import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { DataServiceService } from './../data-service.service';
import { TranslateService } from '@ngx-translate/core';
import { PopTools } from './../pop-tools';
import { PopRoutes } from './../pop-routes';

@Component({
  selector: 'app-member-resources',
  templateUrl: './member-resources.page.html',
  styleUrls: ['./member-resources.page.scss'],
})
export class MemberResourcesPage implements OnInit {
  resources = [];
  folderID: number = 0;
  folderName: string = "";
  separator: string = "";
  parentCaller: string = "";
  memberID: number;
  memberFullname: string;
  errorMessage: string;
  resourceIndex: any;
  resourceType: string = "picture";
  itemName: string;
  pageTitle: string;
  pageTitle2: string;
  lastResource: any;
  infiniteScroll: any;
  ResourceIsPhoto: boolean = false;
  ResourceIsVideo: boolean = false;
  ResourceIsDoc: boolean = false;
  styleNormal: boolean = true;
  styleList: boolean = false;
  styleThumbNails: boolean = false;
  sheetLabels: any = {};

  constructor(private router: Router, private rest: DataServiceService, 
    private translate: TranslateService, private popTools: PopTools, private popRoutes: PopRoutes) { 

      this.translate.stream(['Group_ForumToSmall','Social_Photos2','Social_Videos2','Social_Documents2',
			'All_BTN_Cancel','All_CannotContinue',
			'Social_Videos','Social_Documents','Social_PhotoLike','Social_VideoLike','Social_DocumentLike',
			'Social_Photos','errManInvalidAccess','All_AccessDenied','All_Item_Not_Found','Social_AlreadyLiked',
			'Social_MemberLike','All_Like','All_DontLike','All_Sow_Likes','Social_LikeSet']).subscribe(res => {

      this.sheetLabels = res;
    });
  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    let myParams = this.popRoutes.getCurrentParam();

    this.resources = [];
    if (myParams) {
      if (myParams["parent"]) {this.parentCaller = myParams["parent"];}
      this.memberID = myParams.memberID;
      this.memberFullname = myParams.Fullname;
      this.resourceIndex = myParams.resourceIndex;
    }

    if (!this.resourceIndex) {this.resourceIndex = 1;}
    if (this.resourceIndex == 0) {this.resourceIndex = 1;}
    switch(this.resourceIndex) {
      case 2:
	      this.resourceType = "video";
        this.pageTitle2 = "Social_Videos";
        this.getVideos(null,null);
        this.pageTitle = this.sheetLabels.Social_Videos2 + " " + this.sheetLabels.Group_ForumToSmall + " " + this.memberFullname;
        break;
      case 3:
	      this.resourceType = "document";
        this.pageTitle2 = "Social_Documents";
        this.getDocs(null,null);
        this.pageTitle = this.sheetLabels.Social_Documents2 + " " + this.sheetLabels.Group_ForumToSmall + " " + this.memberFullname;
        break;
      default:
	      this.resourceType = "picture";
        this.pageTitle2 = "Social_Photos";
        this.getPhotos(null,null);
        this.pageTitle = this.sheetLabels.Social_Photos2 + " " + this.sheetLabels.Group_ForumToSmall + " " + this.memberFullname;
    } 
  }

  goBack() {
    this.popRoutes.navigateBackwards();
  }

  getPhotos(folderID,lastDate) {
    this.rest.getMemberPhotos(folderID,this.memberID,lastDate)
       .subscribe(
         resources => this.parsResource(resources),
         error =>  this.errorNotification(error));
  }
  
  getVideos(folderID,lastDate) {
    this.rest.getMemberVideos(folderID,this.memberID,lastDate)
       .subscribe(
         resources => this.parsResource(resources),
         error =>  this.errorNotification(error));
  }
  
  getDocs(folderID,lastDate) {
    this.rest.getMemberDocs(folderID,this.memberID,lastDate)
       .subscribe(
         resources => this.parsResource(resources),
         error =>  this.errorNotification(error));
  }
  
  showPDF(pdfSrcURL) {
   var params = { pdfSrc: pdfSrcURL };

   this.popRoutes.navigateForward('/pdf-viewer', params);
  }

  reloadResource() {
     this.resources = [];
     switch(this.resourceIndex) {
       case 2:
         this.getVideos(this.folderID,null);
         break;
       case 3:
         this.getDocs(this.folderID,null);
         break;
       default:
         this.getPhotos(this.folderID,null);
     } 
  }

  parsResource(resources) {
    this.ResourceIsPhoto = false;
    this.ResourceIsVideo = false;
    this.ResourceIsDoc = false;
    switch(this.resourceIndex) {
      case 2:
	      this.ResourceIsVideo = true;
        this.itemName = resources.VideoName;
        break;
      case 3:
	      this.ResourceIsDoc = true;
        this.itemName = resources.DocName;
        break;
      default:
	      this.ResourceIsPhoto = true;
        this.itemName = resources.PhotoName;
    } 
    resources.forEach(resource => {
	      this.lastResource = resource.DateUploaded;
        this.resources.push(resource);
    });

    if (this.infiniteScroll) {
       this.infiniteScroll.target.complete();
    }
  }

  async ChooseFolder() {
    let params = {"data": { "userID": this.memberID, "groupID": null }};

    this.popRoutes.showModal("FoldersPage", params, (data) => {
      if (data) {
	      this.resources = [];
	      this.separator = "";
   	    this.folderID = data["folderID"];
	      if (data["folderType"] == 1) {this.folderID = 0;}
	      this.folderName = data["folderName"];
	      if (data["folderName"]) {if (data["folderName"] != "") {this.separator = ": ";}}
    	  this.reloadResource();
      }
    });
  }

  showMember(lngMemberID) {
   let params = { memberID: lngMemberID, isFriend: null };

   this.popRoutes.navigateForward('/member-profile', params);
  }

  showObject(lngIndex) {
    var ObjectData = this.resources[lngIndex];
    var params = {"ObjectType": this.resourceType, "ObjectID": ObjectData["ID"], Location: ObjectData["Location"], 
		Description: ObjectData["Description"], "Likes": ObjectData["Likes"], "NLikes": ObjectData["NLikes"], 
		"Comments": ObjectData["Comments"], NoIcons: null, ShowComments: true, "resourceType": this.resourceIndex};

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
	      lngCount = Number(this.resources[lngIndex].Likes) + lngValue;
	      this.resources[lngIndex].Likes = lngCount
	      break;
      case "NLikes":
	      lngCount = Number(this.resources[lngIndex].NLikes) + lngValue;
	      this.resources[lngIndex].NLikes = lngCount
	      break;
      case "Comments":
	      lngCount = Number(this.resources[lngIndex].Comments) + lngValue;
	      this.resources[lngIndex].Comments = lngCount
	      break;
    }
  }
  
  async showAddLikePrompt(lngIndex) {
    var likeTitle = "";

    switch(this.resourceIndex) {
      case 2:
	      likeTitle = this.sheetLabels.Social_VideoLike;
        break;
      case 3:
	      likeTitle = this.sheetLabels.Social_DocumentLike;
        break;
      default:
	      likeTitle = this.sheetLabels.Social_PhotoLike;
    } 
    
    this.popTools.showAddLikePrompt(likeTitle, (data) => {
      if (data == 3) {
        var strTitle = this.sheetLabels[this.pageTitle2] + ": " + this.resources[lngIndex].Description;
        var params = { ObjectType:this.resourceType, ObjectID: this.resources[lngIndex].ID, Title: strTitle };
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
    this.rest.postLike(this.resourceType, this.resources[lngIndex].ID, like)
      .subscribe(
        response => this.parsLikeResponse(response, lngIndex, like),
        error =>  this.popTools.parsPostError(error));
  }

  parsLikeResponse(response,lngIndex,like) {
    var lngCount = 0; var strLocation = "";

    this.popTools.dismissLoading();
    if (response.rowsAffected[0]) {
      if (like == 1) {
	      lngCount = Number(this.resources[lngIndex].Likes) + 1;
	      this.resources[lngIndex].Likes = lngCount;
      } else {
	      lngCount = Number(this.resources[lngIndex].NLikes) + 1;
	      this.resources[lngIndex].NLikes = lngCount;
      }

      strLocation = this.resources[lngIndex].Location;
      if (this.resourceIndex > 1) {strLocation = null;}
      this.popTools.showToast(this.sheetLabels.Social_LikeSet,strLocation);
    } else {
      this.errorNotification(response);
    }
  }

  doInfinite(infiniteScroll) {
    this.infiniteScroll = infiniteScroll;

    if (this.lastResource) {
      var lastDate = this.lastResource;

      this.lastResource = null;
      switch(this.resourceIndex) {
        case 2:
          this.getVideos(this.folderID,lastDate);
          break;
        case 3:
          this.getDocs(this.folderID,lastDate);
          break;
        default:
          this.getPhotos(this.folderID,lastDate);
      } 
    }
  }

  errorNotification(error) {
    this.errorMessage = <any>error;

    if (this.infiniteScroll) {
       this.infiniteScroll.target.complete();
       this.infiniteScroll.target.disabled = true;
    }
  }

  changeStyleNormal() {
    this.styleNormal = true;
    this.styleList = false;
    this.styleThumbNails = false;
  }

  changeStyleList() {
    this.styleNormal = false;
    this.styleList = true;
    this.styleThumbNails = false;
  }

  changeStyleThumbnails() {
    this.styleNormal = false;
    this.styleList = false;
    this.styleThumbNails = true;
  }

  emptyMethod() {

  }

}
