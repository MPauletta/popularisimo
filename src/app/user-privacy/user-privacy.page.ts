import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController  } from '@ionic/angular';

@Component({
  selector: 'app-user-privacy',
  templateUrl: './user-privacy.page.html',
  styleUrls: ['./user-privacy.page.scss'],
})
export class UserPrivacyPage implements OnInit {
  privacyDetails: any;
  formOptions: any;
  formEdit: boolean = false;
  icon: string = "../../assets/imgs/Symbol-Stop.png";

  constructor(private navParams: NavParams, private modalCtrl: ModalController) {
    this.privacyDetails = this.navParams.get('privacy');
    this.formOptions = this.navParams.get('options');
    if (this.formOptions.Mode == "EDIT") {this.formEdit = true;}
  }

  ngOnInit() {
  }

  async saveAndReturn() {
    this.privacyDetails.NotifyOnPhoto = this.privacyDetails.NotifyOnPhoto ? 1 : 0;
    this.privacyDetails.NotifyOnComment = this.privacyDetails.NotifyOnComment ? 1 : 0;
    this.privacyDetails.RecieveFriendReq = this.privacyDetails.RecieveFriendReq ? 1 : 0;
    this.privacyDetails.PortalIsPublic = this.privacyDetails.PortalIsPublic ? 1 : 0;
    this.privacyDetails.HidePortal = this.privacyDetails.HidePortal ? 1 : 0;
    this.privacyDetails.AutoReplyActive = this.privacyDetails.AutoReplyActive ? 1 : 0;
    await this.modalCtrl.dismiss(this.privacyDetails);
  }

  async cancelAndReturn() {
    await this.modalCtrl.dismiss(null);
  }

}
