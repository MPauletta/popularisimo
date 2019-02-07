import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController  } from '@ionic/angular';

@Component({
  selector: 'app-forum-message-editor',
  templateUrl: './forum-message-editor.page.html',
  styleUrls: ['./forum-message-editor.page.scss'],
})
export class ForumMessageEditorPage implements OnInit {
  txtPostText: string = "";
  txtTitle: string = "";
  headerTitle: string = "";
  lngRelatedPostID: number = 0;
  txtRelatedPostTitle: string = "";
  errorMessage: string;
  formOptions: any;
  icon: string = "../../assets/imgs/note.png";
  formEdit: boolean = false;
  friend = {"UserID":"","FullName":""}
  messageDetails = {"Title":"","PostText":"","PictureLocation":"","PhotoLocation":"","RelatedPostID":0,"RelatedPostTitle":""};

  constructor(private navParams: NavParams, private modalCtrl: ModalController) { }

  ngOnInit() {
    this.formOptions = this.navParams.get('options');
    this.headerTitle = this.formOptions.Title;

    this.messageDetails = this.navParams.get('message');
    this.txtTitle = this.messageDetails.Title;
    this.txtPostText = this.messageDetails.PostText;
    if (this.messageDetails.RelatedPostID) {this.lngRelatedPostID = this.messageDetails.RelatedPostID;}
    if (this.messageDetails.RelatedPostTitle) {
       this.txtRelatedPostTitle = this.messageDetails.RelatedPostTitle;
       this.txtTitle = this.messageDetails.RelatedPostTitle;
    }
    if (this.messageDetails.PhotoLocation) {this.icon = this.messageDetails.PhotoLocation;}
    if (this.formOptions.Mode == "EDIT") {this.formEdit = true;}
  }

  async completeAndReturn() {
    this.messageDetails.PostText = this.txtPostText;
    this.messageDetails.Title = this.txtTitle;
    this.messageDetails.RelatedPostID = this.lngRelatedPostID;
    await this.modalCtrl.dismiss(this.messageDetails);
  }

  async cancelAndReturn() {
    await this.modalCtrl.dismiss(null);
  }

  clearRelatedPost() {
    this.txtRelatedPostTitle = "";
    this.messageDetails.RelatedPostID = 0;
  }

}
