import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { CommentAddPage } from './comment-add/comment-add.page';
import { GroupEditPage } from './group-edit/group-edit.page';
import { SelectMyResourcePage } from './select-my-resource/select-my-resource.page';
import { ProductEditPage } from './product-edit/product-edit.page';
import { UploadModalPage } from './upload-modal/upload-modal.page';
import { FoldersPage } from './folders/folders.page';
import { AppStoragePage } from './app-storage/app-storage.page';
import { SelectFriendsPage } from './select-friends/select-friends.page';
import { MessageEditorPage } from './message-editor/message-editor.page';
import { NoteEditorPage } from './note-editor/note-editor.page';
import { ForumMessageEditorPage } from './forum-message-editor/forum-message-editor.page';
import { EventDetailsPage } from './event-details/event-details.page';
import { UserAddressPage } from './user-address/user-address.page';
import { UserInfoPage } from './user-info/user-info.page';
import { UserPrivacyPage } from './user-privacy/user-privacy.page';
import { UserSecurityPage } from './user-security/user-security.page';
import { WatchListPage } from './watch-list/watch-list.page';
import { ShowLikesPage } from './show-likes/show-likes.page';

export interface PageInterface {
  title: string;
  pageName: string;
  url?: string;
  tabComponent?: any;
  index?: number;
  resource?: number;
  icon: string;
  badge?: string;
  itemColor: string;
}

@Injectable({
  providedIn: 'root'
})

export class PopRoutes {
  public isRoot: boolean = true;
  public dataList: any = [];
  public urlList: any = [];
  currentIndex: number = -1;
  parentIndex: number = -1;
	
  public pages: PageInterface[] = [
    { title: 'Member_MyPortal', pageName: 'MainTabsPage', url: '/tabs/my-portal', itemColor:'', tabComponent: 'MyPortalPage', index: 0, icon: 'home' },
    { title: 'Main_Groups', pageName: 'MainTabsPage', url: '/tabs/groups', itemColor:'', tabComponent: 'GroupsPage', index: 1, icon: 'contacts' },
    { title: 'Chat_Chat', pageName: 'MainTabsPage', url: '/tabs/chat', itemColor:'', tabComponent: 'ChatPage', index: 2, icon: 'chatboxes', badge: "2" },
    { title: 'Market_Name', pageName: 'MainTabsPage', url: '/tabs/market', itemColor:'', tabComponent: 'MarketPage', index: 3, icon: 'basket' },
    { title: 'Messenger_Name', pageName: 'MessengerPage', url: '/messenger', itemColor:'', icon: 'mail', badge: "1" },
    { title: 'Main_Friends', pageName: 'FriendsPage', url: '/friends', itemColor:'', icon: 'star' },
    { title: 'Social_Members', pageName: 'MembersPage', url: '/members', itemColor:'', icon: 'people' },
    { title: 'All_Logout', pageName: 'LogOut', url: '/login', itemColor:'', icon: 'log-out' }
  ];
 
  public subpages: PageInterface[] = [
    { title: 'Social_Pictures', pageName: 'MyResourcesPage', url: '/my-resources/1', itemColor:'', resource: 1, icon: 'images' },
    { title: 'Social_Videos', pageName: 'MyResourcesPage', url: '/my-resources/2', itemColor:'', resource: 2, icon: 'film' },
    { title: 'Social_Documents', pageName: 'MyResourcesPage', url: '/my-resources/3', itemColor:'', resource: 3, icon: 'document' },
    { title: 'Social_Calendar', pageName: 'MyCalendarPage', url: '/my-calendar', itemColor:'', icon: 'calendar' },
    { title: 'Main_My_Groups', pageName: 'GroupsPage', url: '/tabs/groups', itemColor:'', icon: 'contacts' },
    { title: 'Product_My', pageName: 'MarketPage', url: '/tabs/market', itemColor:'', icon: 'basket' },
    { title: 'Message_MyNotes', pageName: 'NotesPage', url: '/notes', itemColor:'', icon: 'clipboard' },
    { title: 'Main_Language', pageName: 'Main_Language', url: '/my-portal', itemColor:'', icon: 'globe' },
    { title: 'Main_Options', pageName: 'MainOptionsPage', url: '/main-options', itemColor:'', icon: 'settings' }
  ];
 	
  constructor(private router: Router, private modalCtrl: ModalController) { }

  async navigateForward(url, param){
    this.dataList.push(param);
    this.urlList.push(url);
    this.currentIndex = this.currentIndex + 1;
    await this.router.navigate([url]); 
    this.isRoot = false;

    this.pages.forEach(item => {
      if (item.url == url) {
        item.itemColor = "nice";
      } else  {
        item.itemColor = "";
      }
    });
    this.subpages.forEach(item => {
      if (item.url == url) {
        item.itemColor = "nice";
      } else  {
        item.itemColor = "";
      }
    });
  }

  navigateBackwards(){
    if (this.currentIndex > 0) {
      this.dataList.pop();
      this.urlList.pop();
      this.currentIndex = this.currentIndex - 1;
      this.router.navigate([this.urlList[this.currentIndex]]); 

      this.pages.forEach(item => {
        if (item.url == this.urlList[this.currentIndex]) {
          item.itemColor = "nice";
        } else  {
          item.itemColor = "";
        }
      });
      this.subpages.forEach(item => {
        if (item.url == this.urlList[this.currentIndex]) {
          item.itemColor = "nice";
        } else  {
          item.itemColor = "";
        }
      });  
    }

    if (this.currentIndex > 0) {
      this.isRoot = false;
    } else {
      this.isRoot = true;
    }
  }

  setRoot(url, param){
    this.dataList = [];
    this.urlList = [];
    this.currentIndex = -1;
    this.navigateForward(url, param);
    this.isRoot = true;

    this.pages.forEach(item => {
      if (item.url == url) {
        item.itemColor = "nice";
      } else  {
        item.itemColor = "";
      }
    });
    this.subpages.forEach(item => {
      if (item.url == url) {
        item.itemColor = "nice";
      } else  {
        item.itemColor = "";
      }
    });
  }

  getCurrentParam() {
    return this.dataList[this.currentIndex];
  }

  getCurrentUrl() {
    return this.urlList[this.currentIndex];
  }
		
  async showModal(strComponent,params,next) {
    let component = null;

    switch(strComponent) {
      case "ShowLikesPage":
        component = ShowLikesPage;
        break;
      case "CommentAddPage":
        component = CommentAddPage;
        break;
      case "GroupEditPage":
        component = GroupEditPage;
        break;
      case "SelectMyResourcePage":
        component = SelectMyResourcePage;
        break;
      case "ProductEditPage":
        component = ProductEditPage;
        break;
      case "UploadModalPage":
        component = UploadModalPage;
        break;
      case "FoldersPage":
        component = FoldersPage;
        break;
      case "AppStoragePage":
        component = AppStoragePage;
        break;
      case "SelectFriendsPage":
        component = SelectFriendsPage;
        break;
      case "MessageEditorPage":
        component = MessageEditorPage;
        break;
      case "NoteEditorPage":
        component = NoteEditorPage;
        break;
      case "ForumMessageEditorPage":
        component = ForumMessageEditorPage;
        break;
      case "EventDetailsPage":
        component = EventDetailsPage;
        break;
      case "UserAddressPage":
        component = UserAddressPage;
        break;
      case "UserInfoPage":
        component = UserInfoPage;
        break;
      case "UserPrivacyPage":
        component = UserPrivacyPage;
        break;
      case "UserSecurityPage":
        component = UserSecurityPage;
        break;
      case "WatchListPage":
        component = WatchListPage;
        break;
        
    }

    const formModal = await this.modalCtrl.create({
      component: component,
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
        return next(data);
    })   
    await formModal.present();	        
  }
		
}
