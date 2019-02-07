import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController  } from '@ionic/angular';
import { DataServiceService } from './../data-service.service';

@Component({
  selector: 'app-folders',
  templateUrl: './folders.page.html',
  styleUrls: ['./folders.page.scss'],
})
export class FoldersPage implements OnInit {
  folders = [];
  lastFolder: any;
  userID: number = null;
  groupID: number = null;
  pageTitle: string;
  errorMessage: string;
  infiniteScroll: any;

  constructor(private navParams: NavParams, private modalCtrl: ModalController, private rest: DataServiceService) { }

  ngOnInit() {
    this.userID = this.navParams.get("userID");
    this.groupID = this.navParams.get("groupID");
    if (this.groupID) {
      this.pageTitle = "Group_Folder";
    } else {
      this.pageTitle = "User_Folder";
    }
    this.getFolders();
  }

  getFolders() {
    this.rest.getFolders(this.userID,this.groupID,null)
       .subscribe(
         folders => this.parsFolders(folders),
         error =>  this.errorMessage = <any>error);
  }

  parsFolders(folders) {
    folders.forEach(folder => {
	    this.lastFolder = folder.Created;
      this.folders.push(folder);
    });

    if (this.infiniteScroll) {
       this.infiniteScroll.target.complete();
    }
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

    if (this.lastFolder) {
      var lastDate = this.lastFolder;

      this.lastFolder = null;
      this.rest.getFolders(this.userID,this.groupID,lastDate)
         .subscribe(
           folders => this.parsFolders(folders),
           error =>  this.errorParser(error));	
    }
  }

  getItems(ev: any) {

  }

  async saveAndReturn(folderID, folderType, folderName) {
    await this.modalCtrl.dismiss({"folderID": folderID, "folderType": folderType, "folderName": folderName});
  }

  async cancelAndReturn() {
    await this.modalCtrl.dismiss(null);
  }

  emptyMethod() {

  }

}
