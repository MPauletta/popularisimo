import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { DataServiceService } from './../data-service.service';
import { TranslateService } from '@ngx-translate/core';
import { Events } from '@ionic/angular';
import { PopTools } from './../pop-tools';
import { PopRoutes } from './../pop-routes';

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.page.html',
  styleUrls: ['./messenger.page.scss'],
})
export class MessengerPage implements OnInit {
  messages = [];
  lastMessage: any;
  folderID: number = 0;
  folderTitle: string;
  errorMessage: string;
  strInbox: string;
  separator: string = "";
  friendID: number = null;
  friendFullname: string;
  showFromName: boolean = true;
  infiniteScroll: any;
  formOptions = {"Mode":"ADD","Title":""};
  message = {"Subject":"","Message":"","ToUserIDs":"","BCCUserIDs":"","PictureLocation":"","PhotoLocation":"../../assets/imgs/note.png"};
  sheetLabels: any = {};

  private chatEventHandler: (any) => void;

  constructor(private events: Events, private router: Router, private rest: DataServiceService, private translate: TranslateService, 
      private popTools: PopTools, private popRoutes: PopRoutes) {

    this.chatEventHandler = data => this.handleChatEvents(data);
    this.loadPage(null);
    this.translate.stream(['Message_Choose_Box','Message_Inbox', 'Message_Sent','Message_Draft','Message_Deleted','Message_Create','Message_Successfull','All_BTN_Cancel','Al_SystemError']).subscribe(res => {
      this.sheetLabels = res;
    });
  }

  ngOnInit() {
  }

  ionViewDidEnter() {
//console.log("ionViewDidEnter - this.rest.blnDirty = " + this.rest.blnDirty);
    if (this.rest.blnDirty) {
      this.rest.blnDirty = false;
      this.loadPage(this.folderID);
    }
    this.events.subscribe('Messenger', this.chatEventHandler);
  }

  ionViewWillLeave() {
    this.events.unsubscribe('Messenger', this.chatEventHandler);
  }

  handleChatEvents(data: any): void{
    if (data['Event'] == "Info") {
      this.messages.unshift({MessageID:data.MessageID, UserID:data.Sender, FromFullName:data.FullName, FromPhotoLocation:data.PhotoLocation, Subject:data.Extra, DateSend:data.TimeStamp, Message:data.Contents, ToUserIDs:"", Read:null, Folder:1, Extra:0, PictureLocation:null, Group:0, Parent:0, BCCUserIDs:"", ActionID:0});
    }
  }
    
  goBack() {
    this.popRoutes.navigateBackwards();
  }

  loadPage(folderID) {
    let myParams = this.popRoutes.getCurrentParam();

    this.messages = [];
    if (!folderID) {
      this.folderID = 1;
      this.separator = "";
      this.folderTitle = "Message_Inbox";
    }
    if (myParams) {
      if (myParams.friendID) {this.friendID = myParams.friendID;}    
      if (myParams.friendFullname) {this.friendFullname = myParams.friendFullname; this.separator = ": ";}    
    }  
    this.getMessages();
  }

  getMessages() {
    this.rest.getMessages(this.folderID,this.friendID,null)
       .subscribe(
         messages => this.parsMessages(messages),
         error =>  this.errorMessage = <any>error);
  }

  parsMessages(messages) {
    messages.forEach(message => {
	    message.MarkRead = false;
	    message.PrevFolder = "";
	    if (message.Folder == 1 && message.Read != null) {message.MarkRead = true;}
	    if (message.Folder == 4) {
	      switch(message.Extra) {
	        case 1:
	          message.PrevFolder = this.sheetLabels["Message_Inbox"];
	          break;
	        case 2:
	          message.PrevFolder = this.sheetLabels["Message_Sent"];
	          break;
	        case 3:
	          message.PrevFolder = this.sheetLabels["Message_Draft"];
	          break;
	      }
      }
	    this.lastMessage = message.DateSend;
	    message.Message = message.Message.substring(0, 100);
      this.messages.push(message);
    });
  }

  loadMessages(lngFolder) {
   this.folderID = lngFolder;
   this.messages = [];
   if (lngFolder == 1) {
	  this.showFromName = true;
   } else {
	  this.showFromName = false;
   }
   this.getMessages();
  }

  newMessage() {
   let postString = "";
   let blnSave = false;
   
   this.rest.blnDirty = false;
   this.message = {"Subject":"","Message":"","ToUserIDs":"","BCCUserIDs":"","PictureLocation":"","PhotoLocation":"../../assets/imgs/note.png"};
   let params = { "message": this.message, "options": this.formOptions };

   this.popRoutes.showModal("MessageEditorPage", params, (data) => {
    if (data) {
      delete data.PhotoLocation
      if (data.Save) {
        blnSave = data.Save;
        delete data.Save;
      }
      if (data.PictureLocation == "") {delete data.PictureLocation;}
      for (var key in data) {
        if (postString != "") {postString = postString + "&";}
        postString = postString + key + "=" + data[key];
      }

      this.popTools.showLoading();
      if (blnSave) {
        this.rest.saveNewMessage(postString)
    	    .subscribe(
            response => this.parsResponse(response),
            error =>  this.errorParser(error));
      } else {
        this.rest.sendNewMessage(postString)
    	    .subscribe(
            response => this.parsResponse(response),
            error =>  this.errorParser(error));
      }      
    }
   });

  }

  showMessage(lngMessageID) {
    let params = { messageID: lngMessageID, folderID: this.folderID };
 
    this.popRoutes.navigateForward('/message-details', params);
   }
 
   parsResponse(response) {
    this.popTools.dismissLoading();
    if (response.rowsAffected[0]) {
      this.rest.blnDirty = true;
      this.popTools.showToast(this.sheetLabels["Message_Successfull"], null);
      setTimeout(() => {
        this.showMessage(response["ID"]);
      }, 6000);
    } else {
      this.popTools.showAlert(this.sheetLabels["Al_SystemError"],JSON.stringify(response));
    }
  }

  errorParser(error) {
    this.errorMessage = <any>error;

    this.popTools.dismissLoading();
    let jsonError = JSON.parse(error)
    if (this.infiniteScroll) {
       this.infiniteScroll.target.complete();
       this.infiniteScroll.target.disabled = true;
    }
    if (jsonError.code) {
      if (jsonError.code != "ITEM_NOT_FOUND") {this.popTools.showAlert(this.sheetLabels["Al_SystemError"],error);}
    } else {
      this.popTools.showAlert(this.sheetLabels["Al_SystemError"],error);
    }
  }

  doInfinite(infiniteScroll) {
    this.infiniteScroll = infiniteScroll;

    if (this.lastMessage) {
      var lastDate = this.lastMessage;

      this.lastMessage = null;
      this.rest.getMessages(this.folderID,this.friendID,lastDate)
         .subscribe(
           messages => this.parsMessages(messages),
           error =>  this.errorParser(error));	
    }
  }

  presentActionSheet() {
     let buttons = [
       {
         text: this.sheetLabels["Message_Inbox"],
         handler: () => {
           this.folderTitle = "Message_Inbox";
           this.loadMessages(1);
         }
       },
       {
         text: this.sheetLabels["Message_Sent"],
         handler: () => {
           this.folderTitle = "Message_Sent";
           this.loadMessages(2);
         }
       },
       {
         text: this.sheetLabels["Message_Draft"],
         handler: () => {
           this.folderTitle = "Message_Draft";
           this.loadMessages(3);
         }
       },
       {
         text: this.sheetLabels["Message_Deleted"],
         handler: () => {
           this.folderTitle = "Message_Deleted";
           this.loadMessages(4);
         }
       },
       {
         text: this.sheetLabels["All_BTN_Cancel"],
         role: 'cancel',
         handler: () => { }
       }
     ];

     this.popTools.showActionSheet(this.sheetLabels["Message_Choose_Box"], buttons);
  }
  
  emptyMethod() {

  }

  getItems(ev: any) {

  }

}
