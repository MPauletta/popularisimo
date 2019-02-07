import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { DataServiceService } from './../data-service.service';
import { TranslateService } from '@ngx-translate/core';
import { PopTools } from './../pop-tools';
import { PopRoutes } from './../pop-routes';

@Component({
  selector: 'app-forum',
  templateUrl: './forum.page.html',
  styleUrls: ['./forum.page.scss'],
})
export class ForumPage implements OnInit {
  messages = [];
  lastMessage: any;
  groupID: number = 0;
  forumID: number = 0;
  forumAccess: number = 0;
  activeMember: boolean = false;
  groupAdmin: boolean = false;
  forumName: string;
  groupName: string;
  errorMessage: string;
  strInbox: string;
  showFromName: boolean = true;
  infiniteScroll: any;
  formOptions = {"Mode":"ADD","Title":""};
  sheetLabels: any = {};

  constructor(private router: Router, private rest: DataServiceService, private translate: TranslateService, private popTools: PopTools, private popRoutes: PopRoutes) {

  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    let myParams = this.popRoutes.getCurrentParam();

    this.messages = [];
    this.translate.stream(['Forum_Options','Edit_Description','Change_Access','All_WatchForum','Group_ForumCreator','Group_ForumPost','Update_Message','Access_Public','Login_Submit','Message_Successfull','All_BTN_Cancel','All_Wait','Al_SystemError']).subscribe(res => {
      this.sheetLabels = res;
    });
    if (myParams && myParams.forumID) {
       this.forumID = myParams.forumID;
       this.groupID = myParams.groupID;
       this.forumAccess = myParams.forumAccess;
       this.forumName = myParams.forumName;
       this.groupName = myParams.groupName;
       this.getMessages();
    }
  }

  goBack() {
    this.popRoutes.navigateBackwards();
  }

  getMessages() {
    this.rest.getForumPosts(this.forumID, null)
       .subscribe(
         messages => this.parsMessages(messages),
         error =>  this.parsError(error));
  }

  parsMessages(messages) {
    messages.forEach(message => {
      this.lastMessage = message.PostDate;
      message.PostText = message.PostText.substring(0, 150);
      this.messages.push(message);
    });
    if (messages[0].ActiveMember == 1) {this.activeMember = true;}
    if (messages[0].GroupAdmin == 1) {this.groupAdmin = true;}

    if (this.infiniteScroll) {
       this.infiniteScroll.target.complete();
    }
  }

  parsError(error) {
    let myParams = this.popRoutes.getCurrentParam();

    this.errorMessage = <any>error;
    if (myParams) {
      if (myParams.activeMember) {if (myParams.activeMember == 1) {this.activeMember = true;}}
      if (myParams.groupAdmin) {if (myParams.groupAdmin == 1) {this.groupAdmin = true;}}
    }  
    if (this.infiniteScroll) {
      this.infiniteScroll.target.complete();
      this.infiniteScroll.target.disabled = true;
    }
  }

  editDescription(newDescription) {
    let strDescription = "Description=" + newDescription;

    this.popTools.showLoading();
    this.rest.patchForum(this.groupID, this.forumID, strDescription)
       .subscribe(
        response => this.parsEditResponse(response),
         error =>  this.errorNotification(error));
  }
 
  editAccess(newAccess) {
    let lngAccess = 0;

    if (newAccess != "") {lngAccess = 1;}
    if (this.forumAccess != lngAccess) {
      this.forumAccess = lngAccess;
      this.popTools.showLoading();
      let strAccess = "AccessType=" + lngAccess;
      this.rest.patchForum(this.groupID, this.forumID, strAccess)
        .subscribe(
          response => this.parsEditResponse(response),
          error =>  this.errorNotification(error));
    }
  }
 
  newMessage() {
   let postString = "";  
   let message = {"Title":"","PostText":"","RelatedPostID":0,"PictureLocation":"","PhotoLocation":"../../assets/imgs/note.png"};

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

      this.popTools.showLoading();
      this.rest.newForumPost(this.groupID,this.forumID,postString)
        .subscribe(
          response => this.parsResponse(response),
          error =>  this.errorNotification(error));
    }
   });
  }

  parsEditResponse(response) {
    this.popTools.dismissLoading();
    if (response.rowsAffected[0]) {
      this.popTools.showToast(this.sheetLabels["Update_Message"], null);
    } else {
      this.popTools.showAlert(this.sheetLabels["Al_SystemError"],JSON.stringify(response));
    }
  }

  parsResponse(response) {
    this.popTools.dismissLoading();
    if (response.rowsAffected[0]) {
      this.popTools.showToast(this.sheetLabels["Message_Successfull"], null);
      setTimeout(() => {
        this.showMessage(response["ID"]);
      }, 6000);
    } else {
      this.popTools.showAlert(this.sheetLabels["Al_SystemError"],JSON.stringify(response));
    }
  }

  showEditPrompt() {
      let inputs = [
        {
          name: 'description',
          placeholder: this.sheetLabels["All_Description"]
        },
      ];
      let buttons = [
        {
          text: this.sheetLabels["All_BTN_Cancel"],
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: this.sheetLabels["Login_Submit"],
          handler: data => {
            this.editDescription(data.description);
          }
        }
      ];

    this.popTools.showAlertList(this.sheetLabels["Edit_Description"], null, inputs, buttons);
  }

  showAccessPrompt() {
    let inputs = [{
       type: 'checkbox',
       label: this.sheetLabels["Access_Public"],
       value: '1',
       checked: Boolean(this.forumAccess)
    }];

    let buttons = [{
        text: this.sheetLabels["Login_Submit"],
        handler: (data: any) => {
          this.editAccess(data);
        }
    },{
        text: this.sheetLabels["All_BTN_Cancel"],
        handler: data => {
          console.log('Cancel clicked');
        }
    }];

    this.popTools.showAlertList(this.sheetLabels["Edit_Description"], null, inputs, buttons);
  }

  presentActionSheet() {
   let buttons = [];
   if (this.groupAdmin) {
      buttons.push({
           text: this.sheetLabels["Edit_Description"],
           handler: () => {
             this.showEditPrompt();
           }
      });
      buttons.push({
           text: this.sheetLabels["Change_Access"],
           handler: () => {
             this.showAccessPrompt();
           }
      });
   }
   if (this.activeMember) {
      buttons.push({
           text: this.sheetLabels["All_WatchForum"],
           handler: () => {
             this.emptyMethod();
           }
      });
   }
   buttons.push({
           text: this.sheetLabels["Group_ForumCreator"],
           handler: () => {
             this.emptyMethod();
           }
   });
   buttons.push({
           text: this.sheetLabels["All_BTN_Cancel"],
           role: 'cancel',
           handler: () => { }
   });

   this.popTools.showActionSheet(this.sheetLabels["Forum_Options"], buttons);
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

  doInfinite(infiniteScroll) {
    this.popTools.dismissLoading();
    this.infiniteScroll = infiniteScroll;

    if (this.lastMessage) {
      var lastDate = this.lastMessage;

      this.lastMessage = null;
      this.rest.getForumPosts(this.forumID,lastDate)
         .subscribe(
           messages => this.parsMessages(messages),
           error =>  this.parsError(error));	
    }
  }
  
  showMessage(lngMessageID) {
   let params = { forumName: this.forumName, messageID: lngMessageID };

   this.popRoutes.navigateForward('/forum-message', params);
  }

  getItems(ev: any) {

  }

  emptyMethod() {

  }

}
