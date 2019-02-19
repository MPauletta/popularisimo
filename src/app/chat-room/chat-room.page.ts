import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { UserDataService } from './../user-data.service';
import { DataServiceService } from './../data-service.service';
import { TranslateService } from '@ngx-translate/core';
import { PopTools } from './../pop-tools';
import { PopRoutes } from './../pop-routes';
import { environment } from './../../environments/environment';
import { Events } from '@ionic/angular';
import { ChatIcons } from './../../assets/chaticons';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.page.html',
  styleUrls: ['./chat-room.page.scss'],
})
export class ChatRoomPage implements OnInit {
  messages: any;
  errorMessage: string;
  message = '';
  objectType = 0;
  objectLocation = "";
  objectLocation2 = "";
  FriendID: string = "";
  FriendName: string = "";
  FriendPhoto: string = "";
  lastMessage: string = "";
  unreadMessages: string = "";
  popularisimoUrl: string = environment.popularisimoUrl;
  allIcons: any = ChatIcons;
  showIcons: boolean = false;
  showObject: boolean = false;
  iconGroup: string = "Faces";
  sheetLabels: any = {};
  formOptions = {"Mode":"EDIT","Title":""};
  iconTabs: any = [{"Title": "Chat_Faces", "Group": "Faces"},
		{"Title": "Chat_Faces2", "Group": "Faces2"},
		{"Title": "All_People", "Group": "People"},
		{"Title": "All_Animals", "Group": "Animals"},
		{"Title": "All_Food", "Group": "Food"},
		{"Title": "All_Hearts", "Group": "Hearts"},
		{"Title": "All_Objects", "Group": "Objects"},
		{"Title": "All_Weather", "Group": "Weather"},
		{"Title": "All_Season", "Group": "Season"},
		{"Title": "All_Others", "Group": "Others"}];

  private chatEventHandler: (any) => void;

  constructor(private events: Events, private router: Router, private UserData: UserDataService, private rest: DataServiceService, 
      private translate: TranslateService, private popTools: PopTools, private popRoutes: PopRoutes) { 

      this.chatEventHandler = data => this.handleChatEvents(data);
  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    let myParams = this.popRoutes.getCurrentParam();

    if (myParams) {
      this.FriendID = myParams.friendID;
      this.FriendName = myParams.fullName;
      this.FriendPhoto = myParams.PhotoLocation;
      this.unreadMessages = myParams.Unread;
    }  
    this.UserData.currentChatUser = Number(this.FriendID);
    this.hideTabbar(true);
    this.getChatMessages(this.FriendID);

    this.events.subscribe('chatMessage', this.chatEventHandler);
    this.translate.stream(['Group_Resources','Add_Button','Social_Photos','Social_Photos2','Social_Videos','Social_Videos2','Social_Documents','Social_Documents2','All_BTN_Cancel','All_Wait','Al_SystemError']).subscribe(res => {
      this.sheetLabels = res;
    });
  }

  ionViewWillLeave() {
    this.hideTabbar(false);
    this.UserData.currentChatUser = 0;
    this.events.unsubscribe('chatMessage', this.chatEventHandler);
  }

  handleChatEvents(data: any): void{
    var strTemp = ""; var lngTemp = 0;
    var lngCount = 0;

    if (!this.messages) {this.messages = [];}
    if (data.Sender == this.FriendID) {
      if (data['Event'] == "Info") {
	      switch(data['Message']) {
	        case "Message_Send":
	        case "Message_Read":
	          if (data['MessageID']) {
	            strTemp = data['MessageID'].replace("S","");
	            if (isNaN(strTemp as any)) {
		            lngCount = this.messages.length - 1;
	            } else {
		            lngCount = Number(strTemp);
	            }
	            if (data['Message'] == "Message_Send") {lngTemp = 2;} else {lngTemp = 1;}
	            if (this.messages[lngCount]) {this.messages[lngCount].Read = lngTemp;}
	          }
	          break;
	        case "Message_Read_All":
	          lngCount = this.messages.length - 100;
	          if (lngCount < 0) {lngCount = 0;}
	          while (lngCount < this.messages.length){
	            if (this.messages[lngCount].FromID != this.FriendID && this.messages[lngCount].Read != 1) {
		            this.messages[lngCount].Read = 1;
	            }
	            lngCount++;
	          }	    
	          break;
	        case "User_Connected":
	          lngCount = this.messages.length - 90;
	          if (lngCount < 0) {lngCount = 0;}
	          while (lngCount < this.messages.length){
	            if (this.messages[lngCount].FromID != this.FriendID && this.messages[lngCount].Read == 0) {
		            this.messages[lngCount].Read = 2;
	            }
	            lngCount++;
	          }
	          break;
	      }
      } else {
	      this.messages.push({ID:data.ID, UserID:this.UserData.currentUser.user_id, FromID:this.FriendID, Message:data.Message, Read:0, ObjectType:data.ObjectType, ObjectLocation:data.ObjectLocation, DateSend:data.TimeStamp, DateRead:null});
	      this.rest.socketSendAction(this.FriendID, data.ID, data.MessageID, "Message_Read");
	      setTimeout(() => {
	        this.scrollItemIntoView(data.ID);
	      }, 1000);
      }
    }

  }
    
  getChatMessages(FriendID) {
    this.rest.getChatMessages(FriendID)
       .subscribe(
         messages => this.parsMessages(messages),
         error =>  this.errorMessage = <any>error);
  }

  parsMessages(messages) {
    var lastID = messages.length;

    this.rest.socketSendAction(this.FriendID, 0, 0, "Message_Read_All");
    this.messages = messages;
    if (this.unreadMessages == this.UserData.unreadChats && this.unreadMessages != "") {
      this.UserData.unreadChats = "";
    } else {
      this.getChatStats();
    }

    if (lastID > 0) {
      lastID = messages[lastID - 1].ID;
      setTimeout(() => {
        this.scrollItemIntoView(lastID);
      }, 1000);
    }
  }

  getChatStats() {
    this.rest.getChatStats()
       .subscribe(
         chatStats => this.parsChatStats(chatStats),
         error =>  this.parsChatError(error));
  }

  parsChatStats(chatStats) {
    var lnCount = 0;

    chatStats.forEach(chatStat => {
	    lnCount = lnCount + chatStat.Unread;
    });
    if (lnCount > 0) {
	    this.UserData.unreadChats = lnCount.toString();
    } else {
	    this.UserData.unreadChats = "";
    }
  }

  parsChatError(error) {
    this.errorMessage = <any>error;
  }

  sendMessage() {
    var TimeStamp = new Date();
    var messageID = "";
    let element = document.getElementById("myInputDiv");
    
    if (!this.messages) {this.messages = [];}
    messageID = "S" + this.messages.length;
    if (element.innerHTML != "" || this.objectType > 0) {
      if (this.objectType == 0) {this.objectLocation2 = ""; this.objectLocation = "";}
      this.messages.push({ID:messageID, UserID:this.FriendID, FromID:this.UserData.currentUser.user_id, Message:element.innerHTML, Read:0, ObjectType:this.objectType, ObjectLocation:this.objectLocation2, DateSend:TimeStamp, DateRead:null});
      this.rest.socketSendMessage(this.FriendID, messageID, element.innerHTML, this.objectType, this.objectLocation);
      element.innerHTML = "";
      this.closeWindows();
	    setTimeout(() => {
	      this.scrollItemIntoView(messageID);
	    }, 500);
    }
  }

  closeWindows() {
    this.showObject = false;
    this.objectType = 0;
    this.showIcons = false;
  }

  getEmoticons() {
    this.showObject = false;
    this.showIcons = !this.showIcons;
  }

  changeIconsTab(tabName) {
    this.iconGroup = tabName;
  }

  addChatIcon(iconPath) {
    var thisIcon = ' <img class="emoti-icons" src="' + iconPath + '"> ';

    let element = document.getElementById("myInputDiv");
    element.innerHTML = element.innerHTML + thisIcon;
  }

  scrollItemIntoView(itemID) {
    var strItemID = "message" + itemID;

    var elmnt = document.getElementById(strItemID);
    if (elmnt) {elmnt.scrollIntoView();}
  }

  goBack() {
    this.popRoutes.navigateBackwards();
  }

  async selectResource(indexResource, formTitle) {
   this.formOptions.Title = formTitle;
   let params = { "resourceIndex": indexResource, "options": this.formOptions };

   this.popRoutes.showModal("SelectMyResourcePage", params, (data) => {
console.log(data);	   
    if (data != null) {
      this.objectLocation = data["resourceLocation"];
      this.objectLocation2 = this.popularisimoUrl + data["resourceLocation"].replace(/\\/g,"/");
      if (indexResource == 3) {
        this.objectType = 4;
      } else {
        this.objectType = indexResource;
      }
      this.showObject = true;    
    }
   });
  }

  async presentActionSheet() {
   this.closeWindows();

   var header = this.sheetLabels["Add_Button"] + " " + this.sheetLabels["Group_Resources"];
   var buttons = [{
      text: this.sheetLabels["Social_Photos2"],
      icon: 'images',
      handler: () => {
        this.selectResource(1, this.sheetLabels["Social_Photos"]);
      }
    }, {
      text: this.sheetLabels["Social_Videos2"],
      icon: 'film',
      handler: () => {
        this.selectResource(2, this.sheetLabels["Social_Videos"]);
      }
    }, {
      text: this.sheetLabels["Social_Documents2"],
      icon: 'document',
      handler: () => {
        this.selectResource(3, this.sheetLabels["Social_Documents"]);
      }
    }, {
      text: this.sheetLabels["All_BTN_Cancel"],
      icon: 'close',
      role: 'cancel',
      handler: () => {
        console.log('Cancel clicked');
      }
    }];

   this.popTools.showActionSheet(header, buttons);
  }
  
  hideTabbar(blnHide) {
    let elem = document.querySelector(".tabbar");
    if (elem != null) {
	    if (blnHide) {
        elem['style'].display = "none";
	    } else {
        elem['style'].display = "flex";
	    }
    }      
  }
}
