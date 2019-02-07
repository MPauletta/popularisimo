import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController  } from '@ionic/angular';

@Component({
  selector: 'app-user-address',
  templateUrl: './user-address.page.html',
  styleUrls: ['./user-address.page.scss'],
})
export class UserAddressPage implements OnInit {
  addressDetails: any;
  formOptions: any;
  title: string = "";
  formEdit: boolean = false; 
  icon: string = "../../assets/imgs/map.png";

  constructor(private navParams: NavParams, private modalCtrl: ModalController) {
    this.addressDetails = this.navParams.get('address');
    this.formOptions = this.navParams.get('options');
    this.title = this.formOptions.Title;
    if (this.formOptions.Mode == "EDIT") {this.formEdit = true;}
  }

  ngOnInit() {
  }

  async saveAndReturn() {
    await this.modalCtrl.dismiss(this.addressDetails);
  }

  async cancelAndReturn() {
    await this.modalCtrl.dismiss(null);
  }

}
