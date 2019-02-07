import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController  } from '@ionic/angular';
import { DataServiceService } from './../data-service.service';
import { TranslateService } from '@ngx-translate/core';
import { SelectFriendsPage } from './../select-friends/select-friends.page';

@Component({
  selector: 'app-message-editor',
  templateUrl: './message-editor.page.html',
  styleUrls: ['./message-editor.page.scss'],
})
export class MessageEditorPage implements OnInit {
  toNames: string = "";
  bccNames: string = "";
  txtMessage: string= "";
  txtSubject: string= "";
  errorMessage: string;
  formOptions: any;
  icon: string = "../../assets/imgs/note.png";
  title: string = "";
  formEdit: boolean = false;
  friend = {"UserID":"","FullName":""}
  messageDetails = {"Subject":"","Message":"","ToUserIDs":"","BCCUserIDs":"","PictureLocation":"","PhotoLocation":""};
  sheetLabels: any = {};

  constructor(private navParams: NavParams, private modalCtrl: ModalController, private rest: DataServiceService, private translate: TranslateService) {
    this.formOptions = this.navParams.get('options');
    this.title = this.formOptions.Title;
    if (this.formOptions.Mode == "EDIT") {this.formEdit = true;}

    this.messageDetails = this.navParams.get('message');
    this.txtSubject = this.messageDetails.Subject;
    this.txtMessage = this.messageDetails.Message;
    this.icon = this.messageDetails.PhotoLocation;

    this.getMemberNames();
   }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.translate.stream(['Main_Friends']).subscribe(res => {
      this.sheetLabels = res;
    });
  }

  getMemberNames() {
    if (this.messageDetails.ToUserIDs) {
      this.rest.getMemberNames(this.messageDetails.ToUserIDs)
       .subscribe(
         members => this.setToNames(members),
         error =>  this.errorMessage = <any>error);
    }
  }
  
  setToNames(members) {
    var strNames = "";

    members.forEach(member => {
      if (strNames != "") {strNames = strNames + "; ";}
      strNames = strNames + member.FullName;
    });
    this.toNames = strNames;
    if (this.messageDetails.BCCUserIDs) {
      this.rest.getMemberNames(this.messageDetails.BCCUserIDs)
       .subscribe(
         members => this.setBCCNames(members),
         error =>  this.errorMessage = <any>error);
    }
  }

  setBCCNames(members) {
    var strNames = "";

    members.forEach(member => {
      if (strNames != "") {strNames = strNames + "; ";}
      strNames = strNames + member.FullName;
    });
    this.bccNames = strNames;
  }

  async completeAndReturn(blnSave) {
    this.messageDetails.Message = this.txtMessage;
    this.messageDetails.Subject = this.txtSubject;
    if (blnSave) {this.messageDetails["Save"] = true;} else {this.messageDetails["Save"] = false;}
    await this.modalCtrl.dismiss(this.messageDetails);
  }

  async cancelAndReturn() {
    await this.modalCtrl.dismiss(null);
  }

  async selectRecipient(recType) {
   let params = { "friend": this.friend, "options": {"Mode":"ADD","Title":this.sheetLabels["Main_Friends"]} };

   const formModal = await this.modalCtrl.create({
    component: SelectFriendsPage,
    cssClass: "my-modal",
    showBackdrop: true,
    componentProps: params
   });

   formModal.onDidDismiss().then((data) => {
    if (data) {
      if (data) {
        // When you click outside the modal it returns: {"role":"backdrop"}
        if (data["role"]) {if (data["role"] == "backdrop") {data = null;}}
      }
      if (data) {
        // Sometimes the data is incapsulated into a data key: {"data":null} or {"data":{"item":"Someting"}}}
        if (("data" in data)) {data = data["data"];}
      }

      if (recType == 1) {
        if (this.toNames != "") {
          if (this.toNames.substring(this.toNames.length - 1) != ";") {
            this.toNames = this.toNames + ";";
          }
          if (this.messageDetails.ToUserIDs.substring(this.messageDetails.ToUserIDs.length - 1) != ";") {
            this.messageDetails.ToUserIDs = this.messageDetails.ToUserIDs + ";";
          }
        }
        this.toNames = this.toNames + data["friendName"];
        this.messageDetails.ToUserIDs = this.messageDetails.ToUserIDs + data["friendID"];
      } else {
        if (this.bccNames != "") {
          if (this.bccNames.substring(this.bccNames.length - 1) != ";") {
            this.bccNames = this.bccNames + ";";
          }
          if (this.messageDetails.BCCUserIDs.substring(this.messageDetails.BCCUserIDs.length - 1) != ";") {
            this.messageDetails.BCCUserIDs = this.messageDetails.BCCUserIDs + ";";
          }
        }
        this.bccNames = this.bccNames + data["friendName"];
        this.messageDetails.BCCUserIDs = this.messageDetails.BCCUserIDs + data["friendID"];
      }
    }
   });
   await formModal.present();	      
  }

}
