import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController, LoadingController  } from '@ionic/angular';
import { DataServiceService } from './../data-service.service';
import { UserDataService } from './../user-data.service';
import { TranslateService } from '@ngx-translate/core';
//import { PopTools } from './../pop-tools';
//import { normalizeURL } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { WebView } from '@ionic-native/ionic-webview/ngx';

@Component({
  selector: 'app-upload-modal',
  templateUrl: './upload-modal.page.html',
  styleUrls: ['./upload-modal.page.scss'],
})
export class UploadModalPage implements OnInit {
  anyURL: any;
  anyData: any;
  groupID: number = 0;
  folderID: number = 0;
  errorString: any;
  desc: string;
  lngCount: number;
  ResourceIsPhoto: boolean = false;
  ResourceIsVideo: boolean = false;
  ResourceIsDoc: boolean = false;
  resourceIndex: any;
  backupURL: any;
  sheetLabels: any = {};
  isLoading: boolean = false;

  constructor(private navParams: NavParams, private modalCtrl: ModalController, private UserData: UserDataService, private rest: DataServiceService, 
		private translate: TranslateService, private platform: Platform, private webview: WebView, private loadingCtrl: LoadingController) { 

    this.translate.stream(['All_Wait','All_BTN_Cancel']).subscribe(res => {
      this.sheetLabels = res;
    });
  }

  ngOnInit() {
    if (this.navParams.data.groupID) {this.groupID = this.navParams.data.groupID;}
    if (this.navParams.data.folderID) {this.folderID = this.navParams.data.folderID;}
    this.resourceIndex = Number(this.navParams.data.resourceIndex);
    this.anyData = this.navParams.data.resourceData;

    if (this.platform.is('ios')) {
	  //this.anyURL = normalizeURL(this.anyData);
	  this.anyURL = this.webview.convertFileSrc(this.anyData);
    } else {
	  this.anyURL = this.webview.convertFileSrc(this.anyData);
    }
    
    switch(this.resourceIndex) {
      case 2:
		this.ResourceIsVideo = true;
        break;
      case 3:
		this.ResourceIsDoc = true;
        break;
      default:
		this.ResourceIsPhoto = true;
    }     	  
  }

  saveResource() {
    this.showLoading();
    switch(this.resourceIndex) {
      case 2:
    	this.saveVideo();
        break;
      case 3:
    	this.saveDoc();
        break;
      default:
    	this.saveImage();
    } 
  }

  saveImage() {
    var strToken = this.UserData.userToken;

    this.rest.uploadPhoto(strToken, this.anyData, this.groupID, this.folderID, this.desc).then(res => {
      this.returnLoad(true);
    }, err => {
      this.dismiss();
    });
  }
 
  saveVideo() {
    var strToken = this.UserData.userToken;

    this.rest.uploadVideo(strToken, this.anyData, this.groupID, this.folderID, this.desc).then(res => {
      this.returnLoad(true);
    }, err => {
      this.dismiss();
    });
  }

  saveDoc() {
    var strToken = this.UserData.userToken;

    this.rest.uploadDoc(strToken, this.anyData, this.groupID, this.folderID, this.desc).then(res => {
      this.returnLoad(true);
    }, err => {
      this.dismiss();
    });
  }

  async returnLoad(blnReload) {
    this.dismissLoading();
    await this.modalCtrl.dismiss({reload: blnReload});
  }

  async dismiss() {
    this.dismissLoading();
    await this.modalCtrl.dismiss(null);
  }

  async showLoading() {
    this.isLoading = true;
    return await this.loadingCtrl.create({
      message: 'Please wait...'
    }).then(a => {
      a.present().then(() => {
        if (!this.isLoading) {
          a.dismiss().then(() => this.isLoading = false);
        }
      });
    });		
  }
  
  async dismissLoading() {
    this.isLoading = false;
    return await this.loadingCtrl.dismiss().then(() => this.isLoading = false);		
  }
  
}
