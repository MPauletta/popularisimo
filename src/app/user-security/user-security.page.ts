import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController  } from '@ionic/angular';
import { DataServiceService } from './../data-service.service';
import { UserDataService } from './../user-data.service';
import { AuthServiceService } from './../auth-service.service';
import { TranslateService } from '@ngx-translate/core';
import { PopTools } from './../pop-tools';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-user-security',
  templateUrl: './user-security.page.html',
  styleUrls: ['./user-security.page.scss'],
})
export class UserSecurityPage implements OnInit {
  formOptions: any;
  txtPassword: string = "";
  txtNewPassword: string = "";
  txtConfirmPassword: string = "";
  txtEmail: string = "";
  txtUsername: string = "";
  txtCode: string = "";
  blnChangePassword: boolean = true;
  blnForgotPassword: boolean = false;
  blnUnlockPassword: boolean = false;
  blnForgotComplete: boolean = false;
  blnUnlockComplete: boolean = false;
  blnRecoverPassword: boolean = false;
  strCode: string = "";
  strTitle: string = "";
  strSubTitle1: string = "";
  strSubTitle2: string = "";
  formEdit: boolean = false;
  errorMessage: string;
  icon: string = "../../assets/imgs/lock.png";
  sheetLabels: any = {};

  constructor(private navParams: NavParams, private modalCtrl: ModalController, private auth: AuthServiceService, private UserData: UserDataService, private rest: DataServiceService, private translate: TranslateService, private popTools: PopTools) {
    this.translate.stream(['User_ChangePassword','User_PasswordChanged','errManInvalidAccess','All_AccessDenied',
			'All_CannotContinue','Al_SystemError','User_PassNotEqual','User_PassNotMatched','User_WrongPassword',
			'errSecPasswordInvalid','errManAccLocked','User_PasswordNotVerified','User_Password_Link',
			'All_NoValidUserEmail','User_Locked_Link','User_UnlockSubject','User_RecoverComplete1',
			'User_UnlockComplete','User_UnlockCompleted','User_RecoverCompleted','User_RecoverComplete2',
			'User_ResetSend','User_UnlockSend','All_Invalid_Cellphone','All_Invalid_Country','All_Invalid_Birthday',
			'All_Account_Blocked']).subscribe(res => {
      this.sheetLabels = res;
      this.strTitle = this.sheetLabels["User_ChangePassword"];
    });	  
  }

  ngOnInit() {
    this.formOptions = this.navParams.get('options');
    if (this.formOptions.Mode == "EDIT") {this.formEdit = true;}
  }

  getlogin() {
console.log("==============================");
console.log("Login ...............");
    this.popTools.showLoading();
    this.auth.getUserLogin(this.UserData.currentUser.user_name)
      .subscribe(
        result => this.authenticate(result),
        error =>  this.errorParser(error)
      );
  }

  separateVectorFromData(strData) {
    var iv = strData.slice(-24);
    var message = strData.substring(0, strData.length - 24);

    return{
      iv: iv,
      message: message
    };
  }

  authenticate(result) {
    var strData = "";

console.log("result = " + JSON.stringify(result));
    let passKey = CryptoJS.PBKDF2(this.txtPassword, result.Salt, {
		hasher: CryptoJS.algo.SHA512,
		keySize: 256 / 32,
		iterations: 1000
    });
console.log("passKey = " + CryptoJS.enc.Base64.stringify(passKey));

    try {
      let data = this.separateVectorFromData(result.VerifyKey);

      let decrypted = CryptoJS.AES.decrypt(data.message, passKey, {
          keySize: 256 / 8,
          iv: CryptoJS.enc.Base64.parse(data.iv),
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
      });
console.log("decrypted = " + CryptoJS.enc.Utf8.stringify(decrypted));

      let msgBuff = CryptoJS.enc.Base64.parse(CryptoJS.enc.Utf8.stringify(decrypted));
      let data2 = this.separateVectorFromData(result.VerifyText);

      let decrypted2 = CryptoJS.AES.decrypt(data2.message, msgBuff, {
          keySize: 256 / 8,
          iv: CryptoJS.enc.Base64.parse(data2.iv),
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
      });

      if (decrypted2) {
        strData = CryptoJS.enc.Utf8.stringify(decrypted2);
        strData = strData.replace(/\+/g,"%2B");
        strData = strData.replace(/&/g,"%26");
console.log("decrypted2 = " + strData);
        if (strData == "") {
          this.popTools.showAlert(this.sheetLabels["All_CannotContinue"],this.sheetLabels["User_WrongPassword"]);
        } else {
          this.changePassword(strData);
        }
      }
    } catch(e){
       this.popTools.showAlert(this.sheetLabels["All_CannotContinue"],this.sheetLabels["User_WrongPassword"]);
    }
  }
 
  changePassword(strData) {
    var postString = "Data=" + strData + "&NewPassword=" + this.txtNewPassword + "&ConfirmPassword=" + this.txtConfirmPassword;

    this.rest.patchUserPassword(postString)
      .subscribe(
        response => this.parschangePasswordReponse(response),
        error =>  this.parsPostError(error));
  }
  
  requestAndReturn() {
    var postString = "";

    if (this.txtUsername != "") {
      postString = "Username=" + this.txtUsername;
    } else if (this.txtEmail != "") {
      postString = "EMail=" + this.txtEmail;
    }
    if (postString != "" && this.blnForgotPassword) {
      this.popTools.showLoading();
      this.rest.resetUserPassword(postString)
        .subscribe(
          response => this.parsResetPasswordReponse(response),
          error =>  this.parsPostError(error));
    } else if (postString != "" && this.blnUnlockPassword) {
      this.popTools.showLoading();
      this.rest.unlockUserPassword(postString)
        .subscribe(
          response => this.parsUnlockPasswordReponse(response),
          error =>  this.parsPostError(error));
    }
  }
  
  completeAndReturn() {
    var postString = "";

    if (this.txtCode != "" && this.blnForgotComplete) {
      this.strCode = this.txtCode
      this.blnForgotComplete = false;
      this.blnRecoverPassword = true;
    } else if (this.txtCode != "" && this.blnUnlockComplete) {
      postString = "Code=" + this.txtCode;
      this.popTools.showLoading();
      this.rest.unlockCompletePassword(postString)
        .subscribe(
          response => this.parsUnlockCompleteReponse(response),
          error =>  this.parsPostError(error));
    }
  }

  completeRecover() {
    var postString = "";

    postString = "Code=" + this.strCode + "&NewPassword=" + this.txtNewPassword + "&ConfirmPassword=" + this.txtConfirmPassword;
    if (this.txtCode != "" && this.blnRecoverPassword) {
      this.popTools.showLoading();
      this.rest.resetCompletePassword(postString)
        .subscribe(
          response => this.parsResetCompleteReponse(response),
          error =>  this.parsPostError(error));
    }
  }
  
  parschangePasswordReponse(response) {
    this.popTools.dismissLoading();
    if (response.rowsAffected[0]) {
      this.resetFields();
      this.popTools.showToast(this.sheetLabels["User_PasswordChanged"], null);
    } else {
      this.errorParser(response);
    }
  }

  parsResetPasswordReponse(response) {
    this.popTools.dismissLoading();
    if (response.rowsAffected[0]) {
      this.showCodeRequest(true);
    } else {
      this.errorParser(response);
    }
  }

  parsUnlockPasswordReponse(response) {
    this.popTools.dismissLoading();
    if (response.rowsAffected[0]) {
      this.showCodeRequest(false);
    } else {
      this.errorParser(response);
    }
  }

  parsResetCompleteReponse(response) {
    this.popTools.dismissLoading();
    if (response.rowsAffected[0]) {
      this.resetFields();
      this.showChangePassword();
      this.popTools.showToast(this.sheetLabels["User_RecoverCompleted"], null);
    } else {
      this.errorParser(response);
    }
  }

  parsUnlockCompleteReponse(response) {
    this.popTools.dismissLoading();
    if (response.rowsAffected[0]) {
      this.resetFields();
      this.showChangePassword();
      this.popTools.showToast(this.sheetLabels["User_UnlockCompleted"], null);
    } else {
      this.errorParser(response);
    }
  }

  saveAndReturn() {
    if (this.txtNewPassword == this.txtPassword) {
      this.popTools.showAlert(this.sheetLabels["All_CannotContinue"],this.sheetLabels["User_PassNotEqual"]);
    } else if (this.txtNewPassword != this.txtConfirmPassword) {
      this.popTools.showAlert(this.sheetLabels["All_CannotContinue"],this.sheetLabels["User_PassNotMatched"]);
    } else {
      this.getlogin();
    }
  }

  sendAndReturn() {
    if (this.txtUsername == "" && this.txtEmail == "") {
      this.popTools.showAlert(this.sheetLabels["All_CannotContinue"],this.sheetLabels["All_NoValidUserEmail"]);
    } else if (this.blnForgotPassword || this.blnUnlockPassword) {
      this.requestAndReturn();
    }
  }

  resetFields() {
    this.txtPassword = "";
    this.txtNewPassword = "";
    this.txtConfirmPassword = "";
    this.txtEmail = "";
    this.txtUsername = "";
    this.txtCode = "";
  }

  async cancelAndReturn() {
    await this.modalCtrl.dismiss(null);
  }

  showUnlockPassword() {
    this.blnChangePassword = false;
    this.blnForgotPassword = false;
    this.blnUnlockPassword = true;
    this.strTitle = this.sheetLabels["User_UnlockSubject"];
  }

  showForgotPassword() {
    this.blnChangePassword = false;
    this.blnForgotPassword = true;
    this.blnUnlockPassword = false;
    this.strTitle = this.sheetLabels["User_Password_Link"];
  }

  showChangePassword() {
    this.blnChangePassword = true;
    this.blnForgotPassword = false;
    this.blnUnlockPassword = false;
    this.blnForgotComplete = false;
    this.blnUnlockComplete = false;
    this.blnRecoverPassword = false;
    this.strTitle = this.sheetLabels["User_ChangePassword"];
  }

  showCodeRequest(blnReset) {
    this.blnChangePassword = false;
    this.blnForgotPassword = false;
    this.blnUnlockPassword = false;

    if (blnReset) {
      this.blnForgotComplete = true;
      this.blnUnlockComplete = false;
      this.strTitle = this.sheetLabels["User_Password_Link"];
      this.strSubTitle1 = this.sheetLabels["User_ResetSend"];
      this.strSubTitle2 = this.sheetLabels["User_RecoverComplete1"];
    } else {
      this.blnForgotComplete = false;
      this.blnUnlockComplete = true;
      this.strTitle = this.sheetLabels["User_UnlockSubject"];
      this.strSubTitle1 = this.sheetLabels["User_UnlockSend"];
      this.strSubTitle2 = this.sheetLabels["User_UnlockComplete"];
    }
  }

  parsPostError(error: any) {
    var strMessage = ""; var objError = {};

    objError = JSON.parse(error);
    if (objError["code"]) {
      switch(objError["code"]) {
	case "SYSTEM_ERROR":
	  strMessage = this.sheetLabels["Al_SystemError"];
	  break;
	case "ACCESS_DENIED":
	case "ILLIGAL_ACCESS":
	case "MISSING_AUTHENTICATION_DATA":
	  strMessage = this.sheetLabels["All_AccessDenied"];
	  break;
	case "PASSWORD_NOT_EQUAL":
	case "CONFIRM_PASSWORD_NOT_MATCHED":
	  strMessage = this.sheetLabels["User_PassNotEqual"];
	  break;
	case "PASSWORD_NOT_MATCHED":
	  strMessage = this.sheetLabels["User_PassNotMatched"];
	  break;
	case "WRONG_PASSWORD":
	  strMessage = this.sheetLabels["User_WrongPassword"];
	  break;
	case "INVALID_PASSWORD":
	  strMessage = this.sheetLabels["errSecPasswordInvalid"];
	  break;
	case "ACCOUNT_LOCKED":
	  strMessage = this.sheetLabels["errManAccLocked"];
	  break;
	case "ACCOUNT_BLOCKED":
	  strMessage = this.sheetLabels["All_Account_Blocked"];
	  break;
	case "PASSWORD_NOT_VALID":
	case "INVALID_NEW_PASSWORD":
	case "INVALID_CONFIRM_PASSWORD":
	  strMessage = this.sheetLabels["User_PasswordNotVerified"];
	  break;
	case "USER_NOT_FOUND":
	case "INVALID_USER_EMAIL":
	case "INVALID_USERNAME_OR_EMAIL":
	  strMessage = this.sheetLabels["All_NoValidUserEmail"];
	  break;
	case "INVALID_CELLPHONE":
	  strMessage = this.sheetLabels["All_Invalid_Cellphone"];
	  break;
	case "INVALID_COUNTRY":
	  strMessage = this.sheetLabels["All_Invalid_Country"];
	  break;
	case "INVALID_BIRTHDAY":
	  strMessage = this.sheetLabels["All_Invalid_Birthday"];
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
 
}
