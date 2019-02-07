import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ModalController, } from '@ionic/angular';
import { DataServiceService } from './../data-service.service';
import { UserDataService } from './../user-data.service';
import { TranslateService } from '@ngx-translate/core';
import { PopTools } from './../pop-tools';
import { PopRoutes } from './../pop-routes';
import { UserSecurityPage } from './../user-security/user-security.page';

@Component({
  selector: 'app-main-options',
  templateUrl: './main-options.page.html',
  styleUrls: ['./main-options.page.scss'],
})
export class MainOptionsPage implements OnInit {
  addresses = [];
  userInfo = {};
  errorMessage: string;
  showAddresses: boolean= false;
  showWatchs: boolean= false;
  sheetLabels: any = {};

  constructor(private router: Router, private modalCtrl: ModalController, private rest: DataServiceService, private UserData: UserDataService, 
		private translate: TranslateService, private popTools: PopTools, private popRoutes: PopRoutes) { 

  }

  ngOnInit() {
    this.getUserInfo();
    this.getPrivacy();
    this.getAddresses();

    this.translate.stream(['Al_SystemError','User_Information','User_Addresses','User_Notifications','User_Privacy','User_Security','Update_Message','All_WatchForum','All_WatchFriend']).subscribe(res => {
      this.sheetLabels = res;
    });
  }

  goBack() {
    this.popRoutes.navigateBackwards();
  }

  getAddresses() {
    this.addresses = [];
    this.rest.getAddresses(null)
       .subscribe(
         addresses => this.parsAddresses(addresses),
         error =>  this.errorMessage = <any>error);
  }

  parsAddresses(addresses) {
    addresses.forEach(address => {
        this.addresses.push(address);
    });
  }

  getUserInfo() {
    this.userInfo = {};
    this.rest.getUser()
       .subscribe(
         userInfo => this.parsUserInfo(userInfo),
         error =>  this.errorMessage = <any>error);
  }

  parsUserInfo(userInfo) {
    this.userInfo = userInfo[0];
  }

  getPrivacy() {
    this.rest.getPrivacy()
       .subscribe(
         privacy => this.parsUserPrivacy(privacy),
         error =>  this.errorMessage = <any>error);
  }

  parsUserPrivacy(privacy) {
    this.UserData.userPrivacy = privacy[0];
  }

  editAddress(index) {
   var postString = "";
   let objEdit = {};
   let thisObject = this.addresses[index];

   for (var key in thisObject) {
     objEdit[key] = thisObject[key];
   }

   let params = { "address": objEdit, "options": {"Title": thisObject["lblAddressType"], Mode: "EDIT"} };
   this.popRoutes.showModal("UserAddressPage", params, (data) => {
    if (data) {
      delete data["ID"];
      delete data["UserID"];
      delete data["AddressType"];

      for (var key in data) {
        if (data[key] != thisObject[key]) {
          if (postString != "") {postString = postString + "&";}
          postString = postString + key + "=" + data[key];
        } else {
          delete data[key];
        }
      }

      this.popTools.showLoading();
      this.rest.patchAddress(thisObject.ID,postString).subscribe(
	      response => this.parsAdressResponse(index, response, objEdit),
        error =>  this.errorParser(error)
      );
    }
   });
  }

  parsAdressResponse(index, response, data) {
    this.popTools.dismissLoading();

    if (response.rowsAffected[0]) {
      if (data["City"] != null) {
        this.getAddresses();
      }
      this.popTools.showToast(this.sheetLabels["Update_Message"], null);
    } else {
      this.popTools.showAlert(this.sheetLabels["Al_SystemError"],JSON.stringify(response));
    }
  }

  editUserInfo() {
   var postString = "";
   let objEdit = {};
   let thisObject = this.userInfo;

   for (var key in thisObject) {
     objEdit[key] = thisObject[key];
   }

   let params = { "info": objEdit, "options": {"Title": "", Mode: "EDIT"} };
   this.popRoutes.showModal("UserInfoPage", params, (data) => {
    if (data) {
      delete data["ID"];
      delete data["Username"];
      delete data["AccessLevel"];
      delete data["UserGroup"];
      delete data["Age"];

      for (var key in data) {
        if (data[key] != thisObject[key]) {
          if (postString != "") {postString = postString + "&";}
          postString = postString + key + "=" + data[key];
        } else {
          delete data[key];
        }
      }

      if (postString != "") {
        this.popTools.showLoading();
        this.rest.patchUserInfo(postString).subscribe(
          response => this.parsUserInfoResponse(response),
          error =>  this.errorParser(error)
        );
      }
    }
   });   
  }

  parsUserInfoResponse(response) {
    this.popTools.dismissLoading();

    if (response.rowsAffected[0]) {
      this.getUserInfo();
      this.popTools.showToast(this.sheetLabels["Update_Message"], null);
    } else {
      this.popTools.showAlert(this.sheetLabels["Al_SystemError"],JSON.stringify(response));
    }
  }

  editUserPrivacy() {
   var postString = "";
   let objEdit = {"ID":0};
   let thisObject = this.UserData.userPrivacy;

   for (var key in thisObject) {
     objEdit[key] = thisObject[key];
   }

   let params = { "privacy": objEdit, "options": {"Title": "", Mode: "EDIT"} };
   this.popRoutes.showModal("UserPrivacyPage", params, (data) => {
    if (data) {
      delete data["ID"];
      delete data["UserID"];
      delete data["UserCode"];

      for (var key in data) {
        if (data[key] != thisObject[key]) {
          if (postString != "") {postString = postString + "&";}
          postString = postString + key + "=" + data[key];
        } else {
          delete data[key];
        }
      }

      if (postString != "") {
        this.popTools.showLoading();
        this.rest.patchPrivacy(postString).subscribe(
          response => this.parsUserPrivacyResponse(response),
          error =>  this.errorParser(error)
        );
      }
    }
   });
  }

  parsUserPrivacyResponse(response) {
    this.popTools.dismissLoading();

    if (response.rowsAffected[0]) {
      this.getPrivacy();
      this.popTools.showToast(this.sheetLabels["Update_Message"], null);
    } else {
      this.popTools.showAlert(this.sheetLabels["Al_SystemError"],JSON.stringify(response));
    }
  }

  editWatches(index) {
   var strwatchType = "UserSpace";
   var strTitle = this.sheetLabels["All_WatchFriend"];

   if (index != 1) {
     strwatchType = "ColGroupForums";
     strTitle = this.sheetLabels["All_WatchForum"];
   }

   let params = { "options": {"watchType": strwatchType, "Title": strTitle, Mode: "EDIT"} };
   this.popRoutes.showModal("WatchListPage", params, (data) => {
    if (data) {
      console.log(JSON.stringify(data));
    }
   });
  }

  async editSecurity() {
    let params = { "options": {"Title": "", Mode: "EDIT"} };
   	
    this.popRoutes.showModal("UserSecurityPage", params, (data) => {
      if (data) {
			console.log(JSON.stringify(data));
      }
    });
  }

  errorParser(error) {
    this.errorMessage = <any>error;

    this.popTools.dismissLoading();
    let jsonError = JSON.parse(error)
    if (jsonError.code) {
      if (jsonError.code != "ITEM_NOT_FOUND") {this.popTools.showAlert(this.sheetLabels["Al_SystemError"],error);}
    } else {
      this.popTools.showAlert(this.sheetLabels["Al_SystemError"],error);
    }
  }

  toggleAddresses() {
    this.showAddresses = !this.showAddresses;
  }

  toggleWatchs() {
    this.showWatchs = !this.showWatchs;
  }

}
