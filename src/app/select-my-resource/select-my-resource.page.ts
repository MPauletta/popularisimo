import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController  } from '@ionic/angular';
import { DataServiceService } from './../data-service.service';
import { FoldersPage } from './../folders/folders.page';

@Component({
  selector: 'app-select-my-resource',
  templateUrl: './select-my-resource.page.html',
  styleUrls: ['./select-my-resource.page.scss'],
})
export class SelectMyResourcePage implements OnInit {
  resources = [];
  folderID: number = 0;
  folderName: string = "";
  separator: string = "";
  lastResource: any;
  errorMessage: string;
  resourceIndex: any;
  itemName: string;
  blnSelected: boolean = false;
  ResourceIsPhoto: boolean = false;
  ResourceIsVideo: boolean = false;
  ResourceIsDoc: boolean = false;
  styleList: boolean = false;
  styleThumbNails: boolean = true;
  formOptions: any;
  infiniteScroll: any;

  constructor(private navParams: NavParams, private modalCtrl: ModalController, private rest: DataServiceService) { }

  ngOnInit() {	  
    this.formOptions = this.navParams.get('options');
    this.resources = [];
    this.resourceIndex = this.navParams.data.resourceIndex;

    switch(this.resourceIndex) {
      case 2:
        this.getVideos(null,null);
        break;
      case 3:
		this.changeStyleList();
        this.getDocs(null,null);
        break;
      default:
        this.getPhotos(null,null);
    } 	  
  }

  errorNotification(error) {
    this.errorMessage = <any>error;

    if (this.infiniteScroll) {
       this.infiniteScroll.target.complete();
       this.infiniteScroll.target.disabled = true;
    }
  }

  getPhotos(folderID,lastDate) {
    this.rest.getPhotos(folderID,lastDate)
       .subscribe(
         resources => this.parsResource(resources),
         error =>  this.errorNotification(error));
  }
  
  getVideos(folderID,lastDate) {
    this.rest.getVideos(folderID,lastDate)
       .subscribe(
         resources => this.parsResource(resources),
         error =>  this.errorNotification(error));
  }
  
  getDocs(folderID,lastDate) {
    this.rest.getDocs(folderID,lastDate)
       .subscribe(
         resources => this.parsResource(resources),
         error =>  this.errorNotification(error));
  }

  async selectAndReturn(lngIndex, strLocation) {
    if (!this.blnSelected) {
      this.blnSelected = true;
      let selected = {"resourceIndex":0, "resourceLocation":""};
      let n = strLocation.search("resources");
      if (n == -1) {n = 0;}
      let resourceLocation = strLocation.substr(n);
      resourceLocation = "\\" + resourceLocation.replace(/\//g, "\\");
      if (this.formOptions.returnFull) {
        selected = this.resources[lngIndex];
      } else {
        selected.resourceIndex = lngIndex;
      }    
      selected.resourceLocation = resourceLocation;

      await this.modalCtrl.dismiss(selected);
    }
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

  async ChooseFolder() {
    let params = { "userID": null, "groupID": null };
		
    const formModal = await this.modalCtrl.create({
      component: FoldersPage,
      componentProps: params
      });
      formModal.onDidDismiss().then((data) => {
        if (data) {
          // When you click outside the modal it returns: {"role":"backdrop"}
          if (data["role"]) {if (data["role"] == "backdrop") {data = null;}}
        }
        if (data) {
          // Sometimes the data is incapsulated into a data key: {"data":null} or {"data":{"item":"Someting"}}}
          if (("data" in data)) {data = data["data"];}
        }

        if (data) {
			this.resources = [];
			this.separator = "";
			this.folderID = data["folderID"];
			if (data["folderType"] == 1) {this.folderID = 0;}
			this.folderName = data["folderName"];
			if (data["folderName"]) {if (data["folderName"] != "") {this.separator = ": ";}}
			this.reloadResource()
        }
    })   
    await formModal.present();	        
  }

  async cancelAndReturn() {
    await this.modalCtrl.dismiss(null);
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

  changeStyleList() {
    this.styleList = true;
    this.styleThumbNails = false;
  }

  changeStyleThumbnails() {
    this.styleList = false;
    this.styleThumbNails = true;
  }

  emptyMethod() {

  }

}
