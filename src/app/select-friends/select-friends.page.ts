import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController  } from '@ionic/angular';
import { DataServiceService } from './../data-service.service';

@Component({
  selector: 'app-select-friends',
  templateUrl: './select-friends.page.html',
  styleUrls: ['./select-friends.page.scss'],
})
export class SelectFriendsPage implements OnInit {
  friends = [];
  lastFriend: any;
  infiniteScroll: any;
  errorMessage: string;
  blnSowMessageBox: boolean = false;
  strTitle: string = ""
  strMessage: string = "";
  icon: string = "../../assets/imgs/No_Photo.png";
  formOptions: any;

  constructor(private navParams: NavParams, private modalCtrl: ModalController, private rest: DataServiceService) { }

  ngOnInit() {
    this.formOptions = this.navParams.get('options');
    if (this.formOptions.Title) {this.strTitle = this.formOptions.Title}
    if (this.formOptions.SowMessageBox) {this.blnSowMessageBox = true;}
    this.friends = [];    
    this.getFriends();	  
  }

  getFriends() {
    this.rest.getFriends(null,null)
       .subscribe(
         friends => this.parsFriends(friends),
         error =>  this.errorMessage = <any>error);
  }

  parsFriends(friends) {
    friends.forEach(friend => {
	this.lastFriend = friend.FriendSince;
        this.friends.push(friend);
    });
  }

  errorParser(error) {
    this.errorMessage = <any>error;

    if (this.infiniteScroll) {
       this.infiniteScroll.target.complete();
       this.infiniteScroll.target.disabled = true;
    }
  }

  doInfinite(infiniteScroll) {
    this.infiniteScroll = infiniteScroll;

    if (this.lastFriend) {
      var lastDate = this.lastFriend;

      this.lastFriend = null;
      this.rest.getFriends(null,lastDate)
         .subscribe(
           friends => this.parsFriends(friends),
           error =>  this.errorParser(error));	
    }
  }
  
  async selectAndReturn(lngID, strName, strPhotoLocation) {
    let selected = {"friendID":lngID, "friendName":strName, "message":this.strMessage, "PhotoLocation": strPhotoLocation};

    await this.modalCtrl.dismiss(selected);
  }

  async cancelAndReturn() {
    await this.modalCtrl.dismiss(null);
  }

  emptyMethod() {

  }

  getItems(ev: any) {

  }

}
