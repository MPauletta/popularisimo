import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { DataServiceService } from './../data-service.service';
import { TranslateService } from '@ngx-translate/core';
import { PopTools } from './../pop-tools';
import { PopRoutes } from './../pop-routes';

@Component({
  selector: 'app-forum-message',
  templateUrl: './forum-message.page.html',
  styleUrls: ['./forum-message.page.scss'],
})
export class ForumMessagePage implements OnInit {
  messages = [];
  messageID: number;
  activeMember: boolean = false;
  groupAdmin: boolean = false;
  currentOwnerID: number;
  forumName: string;
  errorMessage: string;
  formOptions = {"Mode":"ADD","Title":""};
  sheetLabels: any = {};

  constructor(private router: Router, private rest: DataServiceService, private translate: TranslateService, 
    private popTools: PopTools, private popRoutes: PopRoutes) {

      this.translate.stream(['Forum_Options','All_WatchForum','Group_ForumBlock','Message_Create','All_BTN_Cancel','Group_ForumPost','Message_Successfull','Al_SystemError','Message_Blocked','Message_AskBlock']).subscribe(res => {
        this.sheetLabels = res;
      });
  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    let myParams = this.popRoutes.getCurrentParam();

    this.messageID = myParams.messageID;
    this.forumName = myParams.forumName;
    this.getMessage(this.messageID);
  }

  goBack() {
    this.popRoutes.navigateBackwards();
  }

  getMessage(strmessageID) {
    this.rest.getForumPost(strmessageID)
       .subscribe(
         messages => this.parsMessages(messages[0]),
         error =>  this.errorMessage = <any>error);
  }

  parsMessages(message) {
    message.Pressed = false;
    if (this.forumName == "") {this.forumName = message.ForumName;}
    this.currentOwnerID = this.messages.length;
    this.messages.push(message);
    if (message.RelatedPostID > 0) {
      this.rest.getForumPost(message.RelatedPostID)
       .subscribe(
         tomessage => this.setToMessage(tomessage[0]),
         error =>  this.errorMessage = <any>error);
    }
    if (message.ActiveMember == 1) {this.activeMember = true;}
    if (message.GroupAdmin == 1) {this.groupAdmin = true;}
  }

  setToMessage(message) {
    var strNames = "";

    strNames = strNames + message.Title;
    this.messages[this.currentOwnerID].toNames = strNames;
  }

  showMessage(lngOwnerID,lngMessageID) {
   if (!this.messages[lngOwnerID].Pressed) {
     this.messages[lngOwnerID].Pressed = true;
     this.getMessage(lngMessageID);
   }
  }

  newMessage(blnReply) {
   let postString = "";  
   let message = {"Title":"","PostText":"","RelatedPostID":0,"RelatedPostTitle":"","PictureLocation":"","PhotoLocation":"../../assets/imgs/note.png"};

   if (blnReply) {message.RelatedPostID = this.messageID; message.RelatedPostTitle = this.messages[0].Title;}
   this.formOptions.Title = this.sheetLabels["Group_ForumPost"];
   let params = { "message": message, "options": this.formOptions };

   this.popRoutes.showModal("ForumMessageEditorPage", params, (data) => {
    if (data) {
      delete data.PhotoLocation
      if (data.PictureLocation == "") {delete data.PictureLocation;}
      for (var key in data) {
        if (postString != "") {postString = postString + "&";}
        postString = postString + key + "=" + data[key];
      }

//console.log(postString);
      this.popTools.showLoading();
      this.rest.newForumPost(this.messages[0].GroupID,this.messages[0].ForumID,postString)
        .subscribe(
          response => this.parsResponse(response),
          error =>  this.errorNotification(error));
    }
   });

  }

  blockMessage() {
//    let strData = "Blocked=1";

    this.popTools.showLoading();
    this.rest.blockForumPost(this.messages[0].GroupID,this.messages[0].ForumID, this.messageID)
       .subscribe(
         response => this.parsBlockResponse(response),
         error =>  this.errorNotification(error));
  }

  parsBlockResponse(response) {
    this.popTools.dismissLoading();
    this.popTools.showToast(this.sheetLabels["Message_Blocked"], null)
  }

  parsResponse(response) {
    this.popTools.dismissLoading();
    if (response.rowsAffected[0]) {
      this.popTools.showToast(this.sheetLabels["Message_Successfull"], null);
//      setTimeout(() => {
//        this.showMessage(response.ID));
//      }, 6000);
    } else {
      this.popTools.showAlert(this.sheetLabels["Al_SystemError"],JSON.stringify(response));
    }
  }

  errorNotification(error) {
    this.errorMessage = <any>error;

    this.popTools.dismissLoading();
    let jsonError = JSON.parse(error)
    if (jsonError.code) {
      if (jsonError.code != "ITEM_NOT_FOUND") {this.popTools.showAlert(this.sheetLabels["Al_SystemError"],error);}
    } else {
      this.popTools.showAlert(this.sheetLabels["Al_SystemError"],error);
    }
  }

  presentActionSheet() {
   let buttons = [];
   if (this.activeMember) {
      buttons.push({
           text: this.sheetLabels["All_WatchForum"],
           handler: () => {
             this.emptyMethod();
           }
      });
   }
   if (this.activeMember) {
      buttons.push({
           text: this.sheetLabels["Message_Create"],
           handler: () => {
             this.emptyMethod();
           }
      });
   }
   if (this.groupAdmin) {
      buttons.push({
           text: this.sheetLabels["Group_ForumBlock"],
           handler: () => {
             this.emptyMethod();
           }
      });
   }
   buttons.push({
           text: this.sheetLabels["All_BTN_Cancel"],
           role: 'cancel',
           handler: () => { }
   });

   this.popTools.showActionSheet(this.sheetLabels["Forum_Options"], buttons);
  }
  
  showBlockPrompt() {
      let buttons = [
        {
          text: this.sheetLabels["All_BTN_Cancel"],
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: this.sheetLabels["Group_ForumBlock"],
          handler: data => {
            this.blockMessage();
          }
        }
      ];
    this.popTools.showAlertList(this.sheetLabels["Group_ForumBlock"], this.sheetLabels["Message_AskBlock"], null, buttons);
  }

  getItems(ev: any) {

  }

  emptyMethod() {

  }

}
