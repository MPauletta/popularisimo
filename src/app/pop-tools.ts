import { Injectable } from '@angular/core';
import { ModalController, AlertController, ActionSheetController, LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CustomToastPage } from './custom-toast/custom-toast.page';
import { ShowLikesPage } from './show-likes/show-likes.page';

@Injectable({
  providedIn: 'root'
})

export class PopTools {
  isLoading: boolean = false;
  sheetLabels: any = {};
	
  constructor(private translate: TranslateService, private modalCtrl: ModalController, 
      private alertCtrl: AlertController, private actionSheetCtrl: ActionSheetController, private loadingCtrl: LoadingController) { 

      this.translate.stream([
        'All_BTN_Cancel','All_Wait','Al_SystemError','All_CannotContinue','errManInvalidAccess','All_AccessDenied','All_Item_Not_Found','Social_AlreadyLiked',
        'Social_MemberLike','All_Like','All_DontLike','All_Sow_Likes','Social_LikeSet']).subscribe(res => {
        this.sheetLabels = res;
      });
    }

  async showActionSheet(strHeader, objButtons) {
    let actionSheet = await this.actionSheetCtrl.create({
      header: strHeader,
      buttons: objButtons
    });
    await actionSheet.present();
  }
  
  async showAlertList(strHeader,strMessage,objInputs,objButtons) {
    let params = {header: strHeader, buttons: objButtons};

    if (strMessage) {params["message"] = strMessage}
    if (objInputs) {params["inputs"] = objInputs}
    const prompt = await this.alertCtrl.create(params);
    await prompt.present();
  }

  async showAddLikePrompt(strTitle, next) {
    const alert = await this.alertCtrl.create({
      header: strTitle,
      buttons: [
        {
          text: this.sheetLabels["All_Like"],
          handler: () => {
            return next(1);
          }
        }, {
          text: this.sheetLabels["All_DontLike"],
          handler: () => {
            return next(2);
          }
        }, {
          text: this.sheetLabels["All_Sow_Likes"],
          handler: () => {
            return next(3);
          }
        }, {
          text: this.sheetLabels["All_BTN_Cancel"],
          role: 'cancel',
          handler: (blah) => {
            return next(0);
          }
        }
      ]
    });
    await alert.present();	
  }

  async showLikes(params, next) {
    const formModal = await this.modalCtrl.create({
      component: ShowLikesPage,
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
        return next(data["likeUserID"]);
      } else {
        return next(0);
      }
    })   
    await formModal.present();	      
  }

  parsPostError(error: any) {
    var strMessage = ""; var objError = {};

    this.dismissLoading();
    objError = JSON.parse(error);
    if (objError["code"]) {
      switch(objError["code"]) {
	      case "INVALID_TYPE":
	        strMessage = this.sheetLabels["errManInvalidAccess"];
	        break;
	      case "INVALID_PARAMETER":
	        strMessage = this.sheetLabels["errManInvalidAccess"];
	        break;
	      case "INVALID_ID":
	        strMessage = this.sheetLabels["errManInvalidAccess"];
	        break;
	      case "ALREADY_POSTED":
	        strMessage = this.sheetLabels["Social_AlreadyLiked"];
	        break;
	      case "ITEM_NOT_FOUND":
	        strMessage = this.sheetLabels["All_Item_Not_Found"];
	        break;
	      case "ACCESS_DENIED":
	        strMessage = this.sheetLabels["All_AccessDenied"];
	        break;
	      default:
	        strMessage = "";
      }

      if (strMessage == "") {
	      this.showAlert(this.sheetLabels["Al_SystemError"],JSON.stringify(error));
      } else {
	      this.showAlert(this.sheetLabels["All_CannotContinue"],strMessage);
      }	
    } else {
      this.showAlert(this.sheetLabels["Al_SystemError"],error);
    }
  }

  async showToast(message: string, PhotoLocation: string) {
    var strButtonText: string = 'Ok';

    let params = { Title: message, ButtonText: strButtonText, PhotoLocation: PhotoLocation };
    const formModal = await this.modalCtrl.create({
      component: CustomToastPage,
      componentProps: {"message": params},
	    showBackdrop: false,
	    cssClass: "toast-modal"
    });
    return await formModal.present();	
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
  
  async showAlert(title,text) {
    this.dismissLoading();
 
    console.log("Aletr: " + title + " | " + text)
    const alert = await this.alertCtrl.create({
      header: title,
      message: text,
      buttons: ['OK']
    });
    await alert.present();		
  }
  
}
