import { Router } from '@angular/router';
import { AuthServiceService } from './../auth-service.service';
import { Component, OnInit } from '@angular/core';
import { UserDataService } from './../user-data.service';
import { TranslateService } from '@ngx-translate/core';
import { PopTools } from './../pop-tools';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  txtCode: string = "";
  txtEmail: string = "";
  txtUsername: string = "";
  txtNewPassword: string = "";
  txtConfirmPassword: string = "";
  blnLogin: boolean = true;
  blnForgotPassword: boolean = false;
  blnUnlockPassword: boolean = false;
  blnForgotComplete: boolean = false;
  blnUnlockComplete: boolean = false;
  blnRecoverPassword: boolean = false;
  strCode: string = "";
  strTitle: string = "";
  strSubTitle1: string = "";
  strSubTitle2: string = "";
  registerCredentials = { EMail: "", Password: "" };
  
  sheetLabels: any = {"All_Welcome":"All_Welcome","All_Guest":"All_Guest","Login_Message":"Login_Message",
		"errManInvalidAccess":"errManInvalidAccess","All_AccessDenied":"All_AccessDenied","All_CannotContinue":"All_CannotContinue",
		"Al_SystemError":"Al_SystemError","User_PassNotEqual":"User_PassNotEqual","User_PassNotMatched":"User_PassNotMatched",
		"User_WrongPassword":"User_WrongPassword","errSecPasswordInvalid":"errSecPasswordInvalid","errManAccLocked":"errManAccLocked",
		"User_PasswordNotVerified":"User_PasswordNotVerified","User_Password_Link":"User_Password_Link",
		"All_NoValidUserEmail":"All_NoValidUserEmail","User_Locked_Link":"User_Locked_Link","User_UnlockSubject":"User_UnlockSubject",
		"User_RecoverComplete1":"User_RecoverComplete1","User_UnlockComplete":"User_UnlockComplete","User_UnlockCompleted":"User_UnlockCompleted",
		"User_RecoverCompleted":"User_RecoverCompleted","User_RecoverComplete2":"User_RecoverComplete2","User_ResetSend":"User_ResetSend",
		"User_UnlockSend":"User_UnlockSend","All_Invalid_Cellphone":"All_Invalid_Cellphone","All_Invalid_Country":"All_Invalid_Country",
		"All_Invalid_Birthday":"All_Invalid_Birthday","All_Account_Blocked":"All_Account_Blocked"};

  constructor(private auth: AuthServiceService, private router: Router, private UserData: UserDataService,private translate: TranslateService, 
		private popTools: PopTools) { 
		
    this.translate.stream(['All_Welcome','All_Guest','errManInvalidAccess','All_AccessDenied','Login_Message',
			'All_CannotContinue','Al_SystemError','User_PassNotEqual','User_PassNotMatched','User_WrongPassword',
			'errSecPasswordInvalid','errManAccLocked','User_PasswordNotVerified','User_Password_Link',
			'All_NoValidUserEmail','User_Locked_Link','User_UnlockSubject','User_RecoverComplete1',
			'User_UnlockComplete','User_UnlockCompleted','User_RecoverCompleted','User_RecoverComplete2',
			'User_ResetSend','User_UnlockSend','All_Invalid_Cellphone','All_Invalid_Country','All_Invalid_Birthday',
			'All_Account_Blocked']).subscribe(res => {
      this.sheetLabels = res;
      this.strTitle = this.sheetLabels.All_Welcome + " " + this.sheetLabels.All_Guest;
    });		
  }

  ngOnInit() {

  }

  public createAccount() {
	this.router.navigate(['/register']);
  }

  getlogin() {
console.log("==============================");
console.log("Login ...............");
    if (this.registerCredentials.EMail === null || this.registerCredentials.Password === null) {
      this.popTools.showAlert(this.sheetLabels.All_CannotContinue,this.sheetLabels.Login_Message);
    } else {
      this.popTools.showLoading();

      this.auth.getUserLogin(this.registerCredentials.EMail)
        .subscribe(
          result => this.authenticate(result),
          error =>  this.parsPostError(error)
        );
    }
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

	if (!result || result == "") { return; }
console.log("result = " + JSON.stringify(result));
    let passKey = CryptoJS.PBKDF2(this.registerCredentials.Password, result.Salt, {
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
          this.popTools.showAlert(this.sheetLabels.All_CannotContinue,this.sheetLabels.User_WrongPassword);
        } else {
          this.login(strData);
        }
      }

    } catch(e){
       this.popTools.showAlert(this.sheetLabels.All_CannotContinue,this.sheetLabels.User_WrongPassword);
    }
  }
 
  public login(strData) {
    this.auth.LoginUser(this.registerCredentials.EMail, strData)
      .subscribe(
         result => this.authenticated(result),
         error =>  this.parsPostError(error)
      );
  }
 
  authenticated(strToken){
console.log("strToken = " + JSON.stringify(strToken));
   this.popTools.dismissLoading();
   this.UserData.setUserInfo(strToken);
   this.auth.finilizeLogin();
   this.router.navigate(['/tabs/my-portal']);
  }

  sendAndReturn() {
    if (this.txtUsername == "" && this.txtEmail == "") {
      this.popTools.showAlert(this.sheetLabels.All_CannotContinue,this.sheetLabels.All_NoValidUserEmail);
    } else if (this.blnForgotPassword || this.blnUnlockPassword) {
      this.requestAndReturn();
    }
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
      this.auth.resetUserPassword(postString)
        .subscribe(
          response => this.parsResetPasswordReponse(response),
          error =>  this.parsPostError(error));
    } else if (postString != "" && this.blnUnlockPassword) {
      this.popTools.showLoading();
      this.auth.unlockUserPassword(postString)
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
      this.auth.unlockCompletePassword(postString)
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
      this.auth.resetCompletePassword(postString)
        .subscribe(
          response => this.parsResetCompleteReponse(response),
          error =>  this.parsPostError(error));
    }
  }
  
  parsResetPasswordReponse(response) {
    this.popTools.dismissLoading();
    if (response.rowsAffected[0]) {
      this.showCodeRequest(true);
    } else {
      this.parsPostError(response);
    }
  }

  parsUnlockPasswordReponse(response) {
    this.popTools.dismissLoading();
    if (response.rowsAffected[0]) {
      this.showCodeRequest(false);
    } else {
      this.parsPostError(response);
    }
  }

  parsResetCompleteReponse(response) {
    this.popTools.dismissLoading();
    if (response.rowsAffected[0]) {
      this.resetFields();
      this.showLogin();
      this.popTools.showToast(this.sheetLabels.User_RecoverCompleted, null);
    } else {
      this.parsPostError(response);
    }
  }

  parsUnlockCompleteReponse(response) {
    this.popTools.dismissLoading();
    if (response.rowsAffected[0]) {
      this.resetFields();
      this.showLogin();
      this.popTools.showToast(this.sheetLabels.User_UnlockCompleted, null);
    } else {
      this.parsPostError(response);
    }
  }

  resetFields() {
    this.txtNewPassword = "";
    this.txtConfirmPassword = "";
    this.txtEmail = "";
    this.txtUsername = "";
    this.txtCode = "";
  }

  showUnlockPassword() {
    this.blnLogin = false;
    this.blnForgotPassword = false;
    this.blnUnlockPassword = true;
    this.strTitle = this.sheetLabels.User_UnlockSubject;
  }

  showForgotPassword() {
    this.blnLogin = false;
    this.blnForgotPassword = true;
    this.blnUnlockPassword = false;
    this.strTitle = this.sheetLabels.User_Password_Link;
  }

  showLogin() {
    this.blnLogin = true;
    this.blnForgotPassword = false;
    this.blnUnlockPassword = false;
    this.blnForgotComplete = false;
    this.blnUnlockComplete = false;
    this.blnRecoverPassword = false;
    this.strTitle = this.sheetLabels.All_Welcome + " " + this.sheetLabels.All_Guest;
  }

  showCodeRequest(blnReset) {
    this.blnLogin = false;
    this.blnForgotPassword = false;
    this.blnUnlockPassword = false;

    if (blnReset) {
      this.blnForgotComplete = true;
      this.blnUnlockComplete = false;
      this.strTitle = this.sheetLabels.User_Password_Link;
      this.strSubTitle1 = this.sheetLabels.User_ResetSend;
      this.strSubTitle2 = this.sheetLabels.User_RecoverComplete1;
    } else {
      this.blnForgotComplete = false;
      this.blnUnlockComplete = true;
      this.strTitle = this.sheetLabels.User_UnlockSubject;
      this.strSubTitle1 = this.sheetLabels.User_UnlockSend;
      this.strSubTitle2 = this.sheetLabels.User_UnlockComplete;
    }
  }

  parsPostError(error: any) {
    var strMessage = ""; var objError = {};

	console.log(error);
    objError = JSON.parse(error);
    if (objError["code"]) {
      switch(objError["code"]) {
	case "SYSTEM_ERROR":
	  strMessage = this.sheetLabels.Al_SystemError;
	  break;
	case "ACCESS_DENIED":
	case "ILLIGAL_ACCESS":
	case "MISSING_AUTHENTICATION_DATA":
	  strMessage = this.sheetLabels.All_AccessDenied;
	  break;
	case "PASSWORD_NOT_EQUAL":
	case "CONFIRM_PASSWORD_NOT_MATCHED":
	  strMessage = this.sheetLabels.User_PassNotEqual;
	  break;
	case "PASSWORD_NOT_MATCHED":
	  strMessage = this.sheetLabels.User_PassNotMatched;
	  break;
	case "WRONG_PASSWORD":
	  strMessage = this.sheetLabels.User_WrongPassword;
	  break;
	case "INVALID_PASSWORD":
	  strMessage = this.sheetLabels.errSecPasswordInvalid;
	  break;
	case "ACCOUNT_LOCKED":
	  strMessage = this.sheetLabels.errManAccLocked;
	  break;
	case "ACCOUNT_BLOCKED":
	  strMessage = this.sheetLabels.All_Account_Blocked;
	  break;
	case "PASSWORD_NOT_VALID":
	case "INVALID_NEW_PASSWORD":
	case "INVALID_CONFIRM_PASSWORD":
	  strMessage = this.sheetLabels.User_PasswordNotVerified;
	  break;
	case "USER_NOT_FOUND":
	case "INVALID_USER_EMAIL":
	case "INVALID_USERNAME_OR_EMAIL":
	  strMessage = this.sheetLabels.All_NoValidUserEmail;
	  break;
	case "INVALID_CELLPHONE":
	  strMessage = this.sheetLabels.All_Invalid_Cellphone;
	  break;
	case "INVALID_COUNTRY":
	  strMessage = this.sheetLabels.All_Invalid_Country;
	  break;
	case "INVALID_BIRTHDAY":
	  strMessage = this.sheetLabels.All_Invalid_Birthday;
	  break;
	default:
	  strMessage = "";
      }
      if (strMessage == "") {
	this.popTools.showAlert(this.sheetLabels.Al_SystemError,JSON.stringify(error));
      } else {
	this.popTools.showAlert(this.sheetLabels.All_CannotContinue,strMessage);
      }	
    } else {
      this.popTools.showAlert(this.sheetLabels.Al_SystemError,error);
    }
  }

}
