import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { DataServiceService } from './../data-service.service';
import { TranslateService } from '@ngx-translate/core';
import { UserDataService } from './../user-data.service';
import { PopTools } from './../pop-tools';
import { PopRoutes } from './../pop-routes';

@Component({
  selector: 'app-message-details',
  templateUrl: './message-details.page.html',
  styleUrls: ['./message-details.page.scss'],
})
export class MessageDetailsPage implements OnInit {
  messages = [];
  messageID: string;
  folderID: number;
  actionMessage: string = "";
  actionType: number = 0;
  errorMessage: string;
  currentUserID: number = 0;
  FolderIsInbox: boolean = false;
  FolderIsSend: boolean = false;
  FolderIsDraft: boolean = false;
  FolderIsDeleted: boolean = false;
  FolderIsInboxSend: boolean = false;
  formOptions = {"Mode":"EDIT","Title":""};
  message = {"Subject":"","Message":"","ToUserIDs":"","BCCUserIDs":"","PictureLocation":"","PhotoLocation":"../../assets/imgs/note.png"};
  sheetLabels: any = {};

  constructor(private router: Router, private UserData: UserDataService, private rest: DataServiceService, private translate: TranslateService, 
    private popTools: PopTools, private popRoutes: PopRoutes) {

      this.translate.stream(['All_Message','Message_Edit','Message_Create','Message_Reply','Message_Successfull','Message_Saved','Message_DeletedOK','Message_Distroyed','Message_RestoredOK','Delete_Text','Message_AskDestroy','Delete_Button','All_BTN_Cancel','All_Wait','Al_SystemError']).subscribe(res => {
        this.sheetLabels = res;
      });  
  }

  ngOnInit() {
    if (this.UserData.currentUser) {
      this.currentUserID = this.UserData.currentUser.user_id;
    } else {
      this.getUserData();
    }
  }

  goBack() {
    this.popRoutes.navigateBackwards();
  }

  ionViewDidEnter() {
    let myParams = this.popRoutes.getCurrentParam();

    this.messageID = myParams.messageID;
    this.folderID = myParams.folderID;
    switch(this.folderID) {
      case 2:
        this.FolderIsSend = true;
        this.FolderIsInboxSend = true;
        break;
      case 3:
        this.FolderIsDraft = true;
        break;
      case 4:
        this.FolderIsDeleted = true;
        break;
      default:
        this.FolderIsInbox = true;
        this.FolderIsInboxSend = true;
    } 
    this.getMessage(this.messageID);
  }

  getUserData() {
    this.UserData.getUserInfo().subscribe(user => {
      if (user) {
        this.currentUserID = user.user_id;
      }
    });
  }
  
  getMessage(strmessageID) {
    this.rest.getMessage(strmessageID)
       .subscribe(
         message => this.parsMessage(message),
         error =>  this.errorMessage = <any>error);
  }

  parsMessage(message) {
    var lngIndex = 0; var lngCount = 0;
    message.Pressed = false;
    message.showBCC = false;
    message.toNames = "";
    message.bccNames = "";

    if (message[0].Read == null){
      if (this.UserData.unreadMessages != "") {
        this.rest.blnDirty = true;
        lngCount = Number(this.UserData.unreadMessages);
        lngCount = lngCount - 1;
        if (lngCount == 0) {
          this.UserData.unreadMessages = "";
        } else {
          this.UserData.unreadMessages = lngCount.toString();
        }
      }
    }

    this.messages.push(message[0]);
    lngIndex = this.messages.length - 1;
    if (this.messages[lngIndex].ToUserIDs) {
      this.rest.getMemberNames(this.messages[lngIndex].ToUserIDs)
       .subscribe(
         members => this.setToNames(members, lngIndex),
         error =>  this.errorMessage = <any>error);
    }
  }

  setToNames(members,lngIndex) {
    var strNames = "";

    members.forEach(member => {
      if (strNames != "") {strNames = strNames + "; ";}
      strNames = strNames + member.FullName;
    });
    this.messages[lngIndex].toNames = strNames;
console.log(this.folderID);
    if (this.messages[lngIndex].BCCUserIDs && this.folderID > 1) {
      this.messages[lngIndex].showBCC = true;
      this.rest.getMemberNames(this.messages[lngIndex].BCCUserIDs)
       .subscribe(
         members => this.setBCCNames(members, lngIndex),
         error =>  this.errorMessage = <any>error);
    }
  }

  setBCCNames(members,lngIndex) {
    var strNames = "";

    members.forEach(member => {
      if (strNames != "") {strNames = strNames + "; ";}
      strNames = strNames + member.FullName;
    });
    this.messages[lngIndex].bccNames = strNames;
  }

  showParent(lngMessageID, lngParentID) {
   if (!this.messages[lngMessageID].Pressed) {
     this.messages[lngMessageID].Pressed = true;
     this.getMessage(lngParentID);
   }
  }

  editMessage(lngAction) {
// Possible Actions are: Add New Message = 1 ; Reply = 2 ; Reply To All = 3 ; Edit message = 4 (only for draft messages) ;
   let postString = "";
   let blnSave = false;
   
   if (lngAction == 4) {
     this.message.ToUserIDs = this.messages[0].ToUserIDs;
     this.message.BCCUserIDs = this.messages[0].BCCUserIDs;
     this.message.Subject = this.messages[0].Subject;
     this.message.Message = this.messages[0].Message;
     this.formOptions.Title = this.sheetLabels["Message_Edit"];
   } else if (lngAction == 2) {
     this.message.ToUserIDs = this.messages[0].UserID;
     if (this.FolderIsSend) {this.message.ToUserIDs = this.messages[0].ToUserIDs}
     this.message.BCCUserIDs = "";
     this.message.Subject = this.messages[0].Subject;
     this.formOptions.Title = this.sheetLabels["Message_Reply"];
   } else if (lngAction == 3) {
     this.message.ToUserIDs = this.messages[0].ToUserIDs;
     this.message.ToUserIDs = ";" + this.message.ToUserIDs + ";";
     this.message.ToUserIDs = this.message.ToUserIDs.replace(";" + this.currentUserID + ";",";");
     if (this.message.ToUserIDs.length > 0) {
      if (this.message.ToUserIDs.substring(0,1) == ";") {this.message.ToUserIDs = this.message.ToUserIDs.substring(1);}
     }
     if (this.message.ToUserIDs.length > 0) {
      if (this.message.ToUserIDs.substring(this.message.ToUserIDs.length - 1) == ";") {this.message.ToUserIDs = this.message.ToUserIDs.substring(0,this.message.ToUserIDs.length-1);}
     }

     if (this.FolderIsInbox) {
      this.message.ToUserIDs = this.messages[0].UserID + ";" +  this.message.ToUserIDs
     }
     this.message.BCCUserIDs = "";
     this.message.Subject = this.messages[0].Subject;
     this.formOptions.Title = this.sheetLabels["Message_Reply"];
   } else {
     this.message.ToUserIDs = "";
     this.message.BCCUserIDs = "";
     this.formOptions.Title = this.sheetLabels["Message_Create"];
   }
   let params = { "message": this.message, "options": this.formOptions };

   this.popRoutes.showModal("MessageEditorPage", params, (data) => {
    if (data) {
      delete data.PhotoLocation
      if (data.hasOwnProperty("Save")) {
        blnSave = data.Save;
        delete data.Save;
      }
      if (lngAction == 2 || lngAction == 3) {data.Parent = this.messageID;}
      if (data.PictureLocation == "") {delete data.PictureLocation;}
      for (var key in data) {
        if (postString != "") {postString = postString + "&";}
        postString = postString + key + "=" + data[key];
      }

console.log(postString);
      this.popTools.showLoading();
      this.rest.blnDirty = true;
      if (lngAction == 4 && !blnSave) {
        this.actionType = 1; // Update current message.
        this.actionMessage = this.sheetLabels["Message_Successfull"];
        this.rest.sendOldMessage(this.messageID, postString)
    	    .subscribe(
            response => this.parsResponse(response),
            error =>  this.errorParser(error));
      } else if (lngAction == 4 && blnSave) {
        this.actionType = 1; // Update current message.
        this.actionMessage = this.sheetLabels["Message_Saved"];
        this.rest.saveOldMessage(this.messageID, postString)
    	    .subscribe(
            response => this.parsResponse(response),
            error =>  this.errorParser(error));
      } else if (blnSave) {
        this.actionType = 2; // Create new message.
        this.actionMessage = this.sheetLabels["Message_Saved"];
        this.popTools.showLoading();
        this.rest.saveNewMessage(postString)
    	    .subscribe(
	          response => this.parsResponse(response),
	          error =>  this.errorParser(error));
      } else {
        this.actionType = 2; // Create new message.
        this.actionMessage = this.sheetLabels["Message_Successfull"];
        this.popTools.showLoading();
        this.rest.sendNewMessage(postString)
    	    .subscribe(
	          response => this.parsResponse(response),
	          error =>  this.errorParser(error));
      }
    }
   });
  }

  deleteRequested() {
    this.rest.blnDirty = true;
    if (this.FolderIsDeleted) {
      this.actionType = 4; // Distroy current message.
      this.actionMessage = this.sheetLabels["Message_Distroyed"];
      this.showDeletePrompt();
    } else {
      this.actionType = 3; // Delete current message.
      this.actionMessage = this.sheetLabels["Message_DeletedOK"];
      this.deleteMessage();
    }
  }

  deleteMessage() {
    this.popTools.showLoading();
    this.rest.deleteMessage(this.messageID)
      .subscribe(
        response => this.parsResponse(response),
        error =>  this.errorParser(error));
  }

  restoreMessage() {
    this.rest.blnDirty = true;
    this.actionType = 1; // Update current message.
    this.actionMessage = this.sheetLabels["Message_RestoredOK"];
    this.popTools.showLoading();
    this.rest.restoreDeletedMessage(this.messageID)
      .subscribe(
        response => this.parsResponse(response),
        error =>  this.errorParser(error));
  }

  parsResponse(response) {
    this.popTools.dismissLoading();
    if (response.rowsAffected[0]) {
      this.popTools.showToast(this.actionMessage, null);
      if (this.actionType == 1) {
        this.messages = [];
        this.getMessage(this.messageID);
      } else if (this.actionType == 2) {
        this.messages = [];
        this.getMessage(response.ID);
      } else {
        this.popRoutes.navigateBackwards();
      }
    } else {
      this.popTools.showAlert(this.sheetLabels["Al_SystemError"],JSON.stringify(response));
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

  showDeletePrompt() {
    let buttons = [
      {
          text: this.sheetLabels["All_BTN_Cancel"],
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: this.sheetLabels["Delete_Button"],
          handler: data => {
            this.deleteMessage();
          }
        }
      ];
    this.popTools.showAlertList(this.sheetLabels["Delete_Text"], this.sheetLabels["Message_AskDestroy"], null, buttons);
  }

  emptyMethod() {

  }

  getItems(ev: any) {

  }

}
