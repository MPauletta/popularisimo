import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { DataServiceService } from './../data-service.service';
import { TranslateService } from '@ngx-translate/core';
import { PopTools } from './../pop-tools';
import { PopRoutes } from './../pop-routes';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/Camera/ngx';

@Component({
  selector: 'app-group-resources',
  templateUrl: './group-resources.page.html',
  styleUrls: ['./group-resources.page.scss'],
})
export class GroupResourcesPage implements OnInit {
  group = {};
  resources = [];
  groupID: number;
  groupFullname: string;
  folderID: number = 0;
  folderName: string = "";
  separator: string = "";
  errorMessage: string;
  resourceIndex: any;
  resourceType: string = "picture";
  itemName: string;
  pageTitle: string;
  pageIcon: string;
  lastResource: any;
  infiniteScroll: any;
  parentCaller: string = "";
  activeMember: boolean = false;
  groupAdmin: boolean = false;
  ResourceIsPhoto: boolean = false;
  ResourceIsVideo: boolean = false;
  ResourceIsDoc: boolean = false;
  styleNormal: boolean = true;
  styleList: boolean = false;
  styleThumbNails: boolean = false;
  videoError: any;
  sheetLabels: any = {};

  constructor(private router: Router, private rest: DataServiceService, private camera: Camera,
    private translate: TranslateService, private popTools: PopTools, private popRoutes: PopRoutes) { 

      this.translate.stream(['Group_ForumToSmall', 'Group_Photos','Group_Videos','Group_Documents','All_Image_Source',
			'All_Video_Source','All_Doc_Source','All_From_Library', 'All_Use_Camera','All_Description',
			'Edit_Description','Edit_LongDescription','All_Save','Delete_Text','Delete_Confirm','Delete_Button',
			'Delete_Message','All_Play_Video','All_FileUploadSucces','Folder_Main','All_BTN_Cancel','All_CannotContinue',
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

    this.folderName = this.sheetLabels.Folder_Main;
    if (myParams) {
      if (myParams["parent"]) {this.parentCaller = myParams["parent"];}
      this.groupID = myParams.GroupID;
      this.groupFullname = myParams.Fullname;
      this.resourceIndex = myParams.resourceIndex;
    }

    if (!this.resourceIndex) {this.resourceIndex = 1;}
    if (this.resourceIndex == 0) {this.resourceIndex = 1;}
    switch(this.resourceIndex) {
      case 2:
	      this.resourceType = "groupvideo";
        this.pageIcon = "videocam";
        this.pageTitle = "Group_Videos";
        this.getGroupVideos(null,null);
        break;
      case 3:
	      this.resourceType = "groupdocument";
        this.pageIcon = "document";
        this.pageTitle = "Group_Documents";
        this.getGroupDocs(null,null);
        break;
      default:
	      this.resourceType = "grouppicture";
        this.pageIcon = "camera";
        this.pageTitle = "Group_Photos";
        this.getGroupPhotos(null,null);
    }

    if (this.groupID) {
      this.resources = [];
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
        error =>  this.errorNotification(error));
  }
  
  parsGroup(group) {
    if (group.ActiveMember == 1) {this.activeMember = true;}
    if (group.GroupAdmin == 1) {this.groupAdmin = true;}

    this.group = group;
  }


  getGroupPhotos(folderID,lastDate) {
    this.rest.getGroupPhotos(folderID,this.groupID,lastDate)
       .subscribe(
         resources => this.parsResource(resources),
         error =>  this.errorNotification(error));
  }
  
  getGroupVideos(folderID,lastDate) {
    this.rest.getGroupVideos(folderID,this.groupID,lastDate)
       .subscribe(
         resources => this.parsResource(resources),
         error =>  this.errorNotification(error));
  }
  
  getGroupDocs(folderID,lastDate) {
    this.rest.getGroupDocs(folderID,this.groupID,lastDate)
       .subscribe(
         resources => this.parsResource(resources),
         error =>  this.errorNotification(error));
  }
  
  showPDF(pdfSrcURL) {
   var params = { pdfSrc: pdfSrcURL };

   this.popRoutes.navigateForward('/pdf-viewer', params);
  }

  editDescription(resourceIndex, resourceID, newDescription) {
    switch(this.resourceIndex) {
      case 2:
        this.editVideoDescription(resourceIndex, resourceID, newDescription);
        break;
      case 3:
        this.editDocDescription(resourceIndex, resourceID, newDescription);
        break;
      default:
        this.editPhotoDescription(resourceIndex, resourceID, newDescription);
    } 
  }

  editPhotoDescription(photoIndex, photoID, newDescription) {
    this.popTools.showLoading();
    this.rest.patchPhoto(photoID, this.groupID, 0, newDescription)
       .subscribe(
         resources => this.descriptionUpdated(photoIndex, newDescription, resources),
         error =>  this.popTools.parsPostError(error));
  }
 
  editVideoDescription(videoIndex, videoID, newDescription) {
    this.popTools.showLoading();
    this.rest.patchVideo(videoID, this.groupID, 0, newDescription)
       .subscribe(
         resources => this.descriptionUpdated(videoIndex, newDescription, resources),
         error =>  this.popTools.parsPostError(error));
  }

  editDocDescription(docIndex, docID, newDescription) {
    this.popTools.showLoading();
    this.rest.patchDoc(docID, this.groupID, 0, newDescription)
       .subscribe(
         resources => this.descriptionUpdated(docIndex, newDescription, resources),
         error =>  this.popTools.parsPostError(error));
  }

  descriptionUpdated(resourceIndex, newDescription, answer) {
    this.popTools.dismissLoading();
   if (answer.rowsAffected) {
     this.resources[resourceIndex].Description = newDescription;
   }
  }

  deleteResource(resourceIndex, resourceID) {
    switch(this.resourceIndex) {
      case 2:
        this.deleteVideo(resourceIndex, resourceID);
        break;
      case 3:
        this.deleteDoc(resourceIndex, resourceID);
        break;
      default:
        this.deletePhoto(resourceIndex, resourceID);
    } 
  }

  deletePhoto(resourceIndex, photoID) {
    this.popTools.showLoading();
    this.rest.deletePhoto(photoID, this.groupID)
       .subscribe(
         resources => this.reloadResource(resources),
         error =>  this.popTools.parsPostError(error));
  }
 
  deleteVideo(resourceIndex, videoID) {
    this.popTools.showLoading();
    this.rest.deleteVideo(videoID, this.groupID)
       .subscribe(
         resources => this.reloadResource(resources),
         error =>  this.popTools.parsPostError(error));
  }

  deleteDoc(resourceIndex, docID) {
    this.popTools.showLoading();
    this.rest.deleteDoc(docID, this.groupID)
       .subscribe(
         resources => this.reloadResource(resources),
         error =>  this.popTools.parsPostError(error));
  }

  reloadResource(answer) {
   this.popTools.dismissLoading();
   if (answer.rowsAffected) {
     this.resources = [];
     switch(this.resourceIndex) {
       case 2:
         this.getGroupVideos(this.folderID,null);
         break;
       case 3:
         this.getGroupDocs(this.folderID,null);
         break;
       default:
         this.getGroupPhotos(this.folderID,null);
     } 
   }
  }

  async ChooseFolder() {
    let params = {"data": { "userID": null, "groupID": this.groupID }};

    this.popRoutes.showModal("FoldersPage", params, (data) => {
      if (data) {
        this.resources = [];
        this.separator = "";
        this.folderID = data["folderID"];
        if (data["folderType"] == 1) {this.folderID = 0;}
        if (data["folderID"] != 0) {
           this.folderName = data["folderName"];
        } else {
           this.folderName = this.sheetLabels.Folder_Main;
        }
        if (data["folderName"]) {if (data["folderName"] != "") {this.separator = ": ";}}     
        this.reloadResource({"rowsAffected":1})
      }
    });
  }

  parsResource(resources) {
    this.ResourceIsPhoto = false;
    this.ResourceIsVideo = false;
    this.ResourceIsDoc = false;
    switch(this.resourceIndex) {
      case 2:
	      this.ResourceIsVideo = true;
        this.itemName = resources.VideoName;
        this.pageTitle = "Group_Videos";
        this.pageIcon = "videocam";
        break;
      case 3:
	      this.ResourceIsDoc = true;
        this.itemName = resources.DocName;
        this.pageTitle = "Group_Documents";
        this.pageIcon = "document";
        break;
      default:
	      this.ResourceIsPhoto = true;
        this.itemName = resources.PhotoName;
        this.pageTitle = "Group_Photos";
        this.pageIcon = "camera";
    } 
    resources.forEach(resource => {
	      this.lastResource = resource.DateUploaded;
        this.resources.push(resource);
    });

    if (this.infiniteScroll) {
       this.infiniteScroll.target.complete();
    }
  }

  presentActionSheet() {
    switch(this.resourceIndex) {
      case 2:
	      this.presentVideoActionSheet();
        break;
      case 3:
	      this.emptyMethod();
        break;
      default:
	      this.presentPhotoActionSheet();
    } 
  }

  async presentPhotoActionSheet() {
    let buttons = [
        {
          text: this.sheetLabels.All_From_Library,
          icon: 'folder-open',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: this.sheetLabels.All_Use_Camera,
          icon: 'camera',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.CAMERA);
          }
        },
        {
          text: this.sheetLabels.All_BTN_Cancel,
          icon: 'close',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ];

    this.popTools.showActionSheet(this.sheetLabels["All_Image_Source"], buttons);
  }

  async presentVideoActionSheet() {
    let buttons = [
        {
          text: this.sheetLabels.All_From_Library,
          icon: 'folder-open',
          handler: () => {
            this.takeVideo(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: this.sheetLabels.All_Use_Camera,
          icon: 'camera',
          handler: () => {
            this.takeVideo(this.camera.PictureSourceType.CAMERA);
          }
        },
        {
          text: this.sheetLabels.All_BTN_Cancel,
          icon: 'close',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ];

    this.popTools.showActionSheet(this.sheetLabels["All_Video_Source"], buttons);
  }

  async showUploadModal(imagePath, resourceIndex) {
    let params = { resourceIndex: resourceIndex, resourceData: imagePath, groupID: this.groupID, folderID: 0 };

    this.popRoutes.showModal("UploadModalPage", params, (data) => {
      if (data && data["reload"]) {
        this.resources = [];
        if (resourceIndex == 3) {
          this.getGroupDocs(this.folderID,null);
        } else if (resourceIndex == 2) {
          this.getGroupVideos(this.folderID,null);
        } else {
          this.getGroupPhotos(this.folderID,null);
        }
        this.popTools.showToast(this.sheetLabels.All_FileUploadSucces, null);
      }
    });
  }

  takePicture(sourceType) {
    // Create options for the Camera Dialog
    var options = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true
    };
 
    // Get the data of an image
    this.camera.getPicture(options).then((imagePath) => {
      this.showUploadModal(imagePath, 0);
    }, (err) => {
      this.errorNotification(err);
    });
  }

  takeVideo(sourceType) {
    // Create options for the Camera Dialog
    var options = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      sourceType: sourceType,
      mediaType: this.camera.MediaType.VIDEO,
      saveToPhotoAlbum: false,
      correctOrientation: true
    };
 
    // Get the data of an image
    this.camera.getPicture(options).then((imagePath) => {
      this.showUploadModal(imagePath, 2);
    }, (err) => {
      this.errorNotification(err);
    });
  }

  async showEditPrompt(resourceIndex, resourceID) {
    let inputs = [
        {
          name: 'description',
          placeholder: this.sheetLabels.All_Description
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
          text: this.sheetLabels.All_Save,
          handler: data => {
            this.editDescription(resourceIndex, resourceID, data.description);
          }
        }
      ];

    this.popTools.showAlertList(this.sheetLabels["Edit_Description"], this.sheetLabels["Edit_LongDescription"], inputs, buttons);
  }

  async showDeletePrompt(resourceIndex, resourceID) {
    let buttons = [
        {
          text: this.sheetLabels.All_BTN_Cancel,
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: this.sheetLabels.Delete_Button,
          handler: data => {
            this.deleteResource(resourceIndex, resourceID);
          }
        }
      ];

    this.popTools.showAlertList(this.sheetLabels["Delete_Text"], this.sheetLabels["Delete_Confirm"], null, buttons);
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
        var strTitle = this.sheetLabels[this.pageTitle] + ": " + this.resources[lngIndex].Description;
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
          this.getGroupVideos(this.folderID,lastDate);
          break;
        case 3:
          this.getGroupDocs(this.folderID,lastDate);
          break;
        default:
          this.getGroupPhotos(this.folderID,lastDate);
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
