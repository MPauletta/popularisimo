import { Router } from '@angular/router';
import { AuthServiceService } from './../auth-service.service';
import { Component, OnInit } from '@angular/core';
import { UserDataService } from './../user-data.service';
import { TranslateService } from '@ngx-translate/core';
import { PopTools } from './../pop-tools';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  countries: any;
  createSuccess = false;
  blnInput: boolean = true;
  blnCode: boolean = false;
  txtCode: string = "";
  txtEmail: string = "";
  txtPassword: string = "";
  strTitle: string = "";
  strSubTitle1: string = "";
  strSubTitle2: string = "";
  strCode: string = "";
  registerCredentials = { Correo: '', Password: '', Usuario: '', FirstName: '', LastName: '', Language: '', CellPhone: '', Gender: 0, Country: '', Birthday: '' };

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
    this.getCountries();
  }

  ngOnInit() {
    this.UserData.getUserInfo().subscribe(user => {
     	if (user) {
    	   this.registerCredentials.Correo = "";
	    }
    });
  }

  getCountries() {
    this.auth.getCountries()
      .subscribe(
        items => this.countries = items,
        error => this.popTools.showAlert(this.sheetLabels.Al_SystemError,JSON.stringify(error)));
  }
  
  register() {
   var postString = "";

console.log("==============================");
console.log("Register ...............");
    if (this.registerCredentials.Correo === null || this.registerCredentials.Password === null) {
      this.popTools.showAlert(this.sheetLabels.All_CannotContinue,this.sheetLabels.Login_Message);
    } else {
      this.popTools.showLoading();

      for (var key in this.registerCredentials) {
	    if (postString != "") {postString = postString + "&";}
		switch (key) {
		  case "Correo":
			postString = postString + "EMail=" + this.registerCredentials[key];
			break;
		  case "Usuario":
			postString = postString + "Username=" + this.registerCredentials[key];
			break;
		  default:
			postString = postString + key + "=" + this.registerCredentials[key];
		}
	  }

      this.auth.register(postString)
        .subscribe(
           response => this.parsRegistration(response),
           error =>  this.parsPostError(error)
        );
    }
  }

  parsRegistration(response) {
    this.popTools.dismissLoading();
    if (response.rowsAffected[0]) {
      this.blnInput = false;
      this.blnCode = true;
    } else {
      this.parsPostError(response);
    }
  }

  completeAndReturn() {
    var postString = "";

    postString = "Code=" + this.txtCode;
    this.popTools.showLoading();
    this.auth.registerComplete(postString)
      .subscribe(
        response => this.parsRegisterComplete(response),
        error =>  this.parsPostError(error));

  }

  parsRegisterComplete(response) {

    this.popTools.dismissLoading();
    if (response.objToken) {
      this.UserData.setUserInfo(response.objToken);
      this.auth.finilizeLogin();
      this.router.navigate(['/tabs/my-portal']);
    } else {
      this.parsPostError(response);
    }
  }

  parsPostError(error: any) {
    var strMessage = ""; var objError = {};

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
