import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController  } from '@ionic/angular';
import { DataServiceService } from './../data-service.service';

@Component({
  selector: 'app-show-likes',
  templateUrl: './show-likes.page.html',
  styleUrls: ['./show-likes.page.scss'],
})
export class ShowLikesPage implements OnInit {
  likes = [];
  separator: string = "";
  lastLike: any;
  errorMessage: string;
  objectType: number = 0;
  objectID: number = 0;
  itemName: string;
  styleList: boolean = true;
  styleThumbNails: boolean = false;
  title: string = "";
  infiniteScroll: any;

  constructor(private navParams: NavParams, private modalCtrl: ModalController, private rest: DataServiceService) { }

  ngOnInit() {
    this.likes = [];
    this.objectType = this.navParams.data.ObjectType;
    this.objectID = this.navParams.data.ObjectID;
    this.title = this.navParams.data.Title;
    this.getLikes(this.objectType,this.objectID,null,null);	  
  }

  getLikes(ObjectType,ObjectID,LastDate,LikeID) {
    this.rest.getLikes(ObjectType,ObjectID,LastDate,LikeID)
       .subscribe(
         likes => this.parsLike(likes),
         error =>  this.errorNotification(error));
  }
  
  async selectAndReturn(lngID,lngUserID) {
    let selected = {"likeID":lngID, "likeUserID":lngUserID};
    await this.modalCtrl.dismiss(selected);
  }

  async cancelAndReturn() {
    await this.modalCtrl.dismiss(null);
  }

  parsLike(likes) {
    likes.forEach(like => {
	this.lastLike = like.DateAdded;
        this.likes.push(like);
    });

    if (this.infiniteScroll) {
       this.infiniteScroll.target.complete();
    }
  }
 
  doInfinite(infiniteScroll) {
    this.infiniteScroll = infiniteScroll;

    if (this.lastLike) {
      var lastDate = this.lastLike;

      this.lastLike = null;
      this.getLikes(this.objectType,this.objectID,lastDate,null); 
    } else {
       this.infiniteScroll.target.complete();
       this.infiniteScroll.target.disabled = true;
    }
  }

  errorNotification(error) {
    this.errorMessage = <any>error;

    if (this.infiniteScroll) {
       this.infiniteScroll.target.complete();
       this.infiniteScroll.target.disabled = true;
    }
  }

  emptyMethod() {

  }

}
