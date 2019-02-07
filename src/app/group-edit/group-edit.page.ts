import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController  } from '@ionic/angular';

@Component({
  selector: 'app-group-edit',
  templateUrl: './group-edit.page.html',
  styleUrls: ['./group-edit.page.scss'],
})
export class GroupEditPage implements OnInit {
  groupDetails: any;
  formOptions: any;
  icon: string = "../../assets/imgs/Group_Meeting_Dark.png";
  title: string = "";
  formEdit: boolean = false;

  constructor(private navParams: NavParams, private modalCtrl: ModalController) { }

  ngOnInit() {
    this.groupDetails = this.navParams.get('group');
    this.formOptions = this.navParams.get('options');
    if (this.groupDetails.PhotoLocation) {this.icon = this.groupDetails.PhotoLocation;}
    this.title = this.formOptions.Title;
    if (this.formOptions.Mode == "EDIT") {this.formEdit = true;}
  }

  async saveAndReturn() {
    await this.modalCtrl.dismiss(this.groupDetails);
  }

  async cancelAndReturn() {
    await this.modalCtrl.dismiss(null);
  }

}
