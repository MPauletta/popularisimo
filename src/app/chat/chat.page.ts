import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { UserDataService } from './../user-data.service';
import { DataServiceService } from './../data-service.service';
import { TranslateService } from '@ngx-translate/core';
import { Events } from '@ionic/angular';
import { PopRoutes } from './../pop-routes';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  messages: any;
  errorMessage: string;
  sheetLabels: any = {"All_File":"All_File"};

  private chatEventHandler: (any) => void;

  constructor(private events: Events, private router: Router, private UserData: UserDataService, private rest: DataServiceService, 
        private translate: TranslateService, private popRoutes: PopRoutes) {

    this.chatEventHandler = data => this.handleChatEvents(data);
  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.translate.stream(['All_File']).subscribe(res => {
      this.sheetLabels = res;
      this.getChats();
    });
  }

  ionViewWillLeave() {
    this.UserData.currentChatUser = 0;
    this.events.unsubscribe('chatMessage', this.chatEventHandler);
  }

  getChats() {
    this.rest.getChats()
       .subscribe(
         messages => this.parsMessages(messages),
         error =>  this.errorMessage = <any>error);
  }

  parsMessages(messages) {
    var strTemp = "";

    this.messages = [];
    messages.forEach(message => {
      strTemp = "";
      if (!message.Message || message.Message == "") {if (message.ObjectType && message.ObjectType > 0) {strTemp = "[" + this.sheetLabels.All_File + "]";}} else {strTemp = message.Message;}
      message.Message = strTemp;
      this.messages.push(message);
    });
    this.events.subscribe('chatMessage', this.chatEventHandler);
  }

  handleChatEvents(data: any): void{
    var strTemp = "";
    var lngCount = 0;
    var lngTemp = 0;
    
    if (data['Event'] == "Chat") {
      while (lngCount < this.messages.length){
        if (this.messages[lngCount].FriendID == data.Sender) {
	        if (this.messages[lngCount].StatData.Unread == "") {
	          this.messages[lngCount].StatData.Unread = "1";
	        } else {
	          strTemp = this.messages[lngCount].StatData.Unread;
	          lngTemp = Number(strTemp);
	          lngTemp = lngTemp + 1;
	          this.messages[lngCount].StatData.Unread = lngTemp.toString();
	        }

	        strTemp = "";
	        if (!data.Message || data.Message == "") {if (data.ObjectType && data.ObjectType > 0) {strTemp = "[" + this.sheetLabels.All_File + "]";}} else {strTemp = data.Message;}
	        this.messages[lngCount].Message = strTemp;
	        this.messages[lngCount].DateSend = data.TimeStamp;
	        lngCount = this.messages.length;
	      }
        lngCount++;
      }
    }
  }
    
  mySatus() {

  }

  showChatMessages(lngFriendID,strFullName,strPhotoLocation, strUnread) {
   let params = { friendID: lngFriendID, fullName: strFullName, PhotoLocation: strPhotoLocation, Unread: strUnread };

   this.popRoutes.navigateForward('/chat-room', params);
  }

}
