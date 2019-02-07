import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController  } from '@ionic/angular';
import { DataServiceService } from './../data-service.service';
import { TranslateService } from '@ngx-translate/core';
import { PopTools } from './../pop-tools';

@Component({
  selector: 'app-watch-list',
  templateUrl: './watch-list.page.html',
  styleUrls: ['./watch-list.page.scss'],
})
export class WatchListPage implements OnInit {
  watchs = [];
  lastwatch: any;
  watchType: string = "UserSpace"
  strTitle: string = ""
  strMessage: string = "";
  infiniteScroll: any;
  errorMessage: string;
  formOptions: any;
  icon: string = "../../assets/imgs/news_subscribe.png";
  sheetLabels: any = {};

  constructor(private navParams: NavParams, private modalCtrl: ModalController, private rest: DataServiceService, private translate: TranslateService, private popTools: PopTools) {
    this.translate.stream(['All_Watch','All_Watching','All_WatchDisable','All_WatchEnable','Member_AlreadyWatch','Member_NotWatchSelf',
			'Member_WatchRemoved','Member_WatchSet','errManInvalidAccess','All_Item_Not_Found','All_AccessDenied','All_CannotContinue',
			'Al_SystemError']).subscribe(res => {
      this.sheetLabels = res;
    });	  
  }

  ngOnInit() {	  
    this.formOptions = this.navParams.get('options');
    if (this.formOptions.Title) {this.strTitle = this.formOptions.Title}
    if (this.formOptions.watchType) {this.watchType = this.formOptions.watchType}
    this.watchs = [];    
    this.getWatchs();
  }
  
  getWatchs() {
    this.rest.getWatches(this.watchType, null, null)
       .subscribe(
         watchs => this.parswatchs(watchs),
         error =>  this.errorParser(error));
  }

  parswatchs(watchs) {
    watchs.forEach(watch => {
		this.lastwatch = watch.DateAdded;
		if (watch.IsActive == 1) {
			watch.Label = this.sheetLabels["All_Watching"];
		} else {
			watch.Label = "";
		}

        this.watchs.push(watch);
    });
  }

  changewatchs(watchsID,lngIndex,option) {
    var postString = "IsActive=" + option;

	this.popTools.showLoading();
    this.rest.patchWatch(watchsID, postString)
       .subscribe(
         response => this.parsWatchResponse(response,lngIndex,option),
         error =>  this.parsPostError(error));
  }

  parsWatchResponse(response,lngIndex,option) {
    var strResponse = "";

    this.popTools.dismissLoading();
    if (response.rowsAffected[0]) {
      if (option == 1) {
		this.watchs[lngIndex].Label = this.sheetLabels["All_Watching"];
		strResponse = this.sheetLabels["Member_WatchSet"];
      } else {
		this.watchs[lngIndex].Label = "";
		strResponse = this.sheetLabels["Member_WatchRemoved"];
      }

      this.popTools.showToast(strResponse,this.watchs[lngIndex].PhotoLocation);
    } else {
      this.errorParser(response);
    }
  }

  parsPostError(error: any) {
    var strMessage = ""; var objError = {};

    this.popTools.dismissLoading();
    objError = JSON.parse(error);
    if (objError["code"]) {
      switch(objError["code"]) {
	case "INVALID_ID":
	  strMessage = this.sheetLabels["errManInvalidAccess"];
	  break;
	case "ITEM_NOT_FOUND":
	  strMessage = this.sheetLabels["All_Item_Not_Found"];
	  break;
	case "ACCESS_DENIED":
	  strMessage = this.sheetLabels["All_AccessDenied"];
	  break;
	case "ALREADY_WATCHED":
	  strMessage = this.sheetLabels["Member_AlreadyWatch"];
	  break;
	case "CANNOT_WATCH_SELF":
	  strMessage = this.sheetLabels["Member_NotWatchSelf"];
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

  presentActionSheet(watchID, lngIndex) {
   var buttons = [];
   var blnIsActive = this.watchs[lngIndex].IsActive;

   buttons = [];
   if (blnIsActive) {
      buttons.push({
           text: this.sheetLabels["All_WatchDisable"],
           handler: () => {
             this.changewatchs(watchID, lngIndex, 0);
           }
      });
   } else {
      buttons.push({
           text: this.sheetLabels["All_WatchEnable"],
           handler: () => {
             this.changewatchs(watchID, lngIndex, 1);
           }
      });
   }

   buttons.push({
           text: this.sheetLabels["All_BTN_Cancel"],
           role: 'cancel',
           handler: () => { }
   });
   
   this.popTools.showActionSheet(this.sheetLabels["All_Watch"], buttons);   
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

    if (this.lastwatch) {
      var lastDate = this.lastwatch;

      this.lastwatch = null;
      this.rest.getWatches(this.watchType, null, lastDate)
         .subscribe(
           watchs => this.parswatchs(watchs),
           error =>  this.errorParser(error));	
    }
  }
  
  async cancelAndReturn() {
    await this.modalCtrl.dismiss(null);
  }

  emptyMethod() {

  }

  getItems(ev: any) {

  }

}
