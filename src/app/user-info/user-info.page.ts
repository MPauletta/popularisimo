import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController  } from '@ionic/angular';
import { DataServiceService } from './../data-service.service';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.page.html',
  styleUrls: ['./user-info.page.scss'],
})
export class UserInfoPage implements OnInit {
  infoDetails: any;
  formOptions: any;
  countries: any;
  formEdit: boolean = false;
  icon: string = "../../assets/imgs/05_phonebook.png";

  constructor(private navParams: NavParams, private modalCtrl: ModalController, private rest: DataServiceService) {
    this.getCountries();
  }

  ngOnInit() {
    this.infoDetails = this.navParams.get('info');
    this.formOptions = this.navParams.get('options');
    if (this.formOptions.Mode == "EDIT") {this.formEdit = true;}
  }

  getCountries() {
    this.rest.getProductPropertyList("countries")
      .subscribe(
        items => this.countries = items,
        error =>  console.log(error));
  }
  
  async saveAndReturn() {
    await this.modalCtrl.dismiss(this.infoDetails);
  }

  async cancelAndReturn() {
    await this.modalCtrl.dismiss(null);
  }

}
