import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController  } from '@ionic/angular';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.page.html',
  styleUrls: ['./event-details.page.scss'],
})
export class EventDetailsPage implements OnInit {
  eventDetails: any;
  formOptions: any;
  icon: string = null;
  formEdit: boolean = false;

  constructor(private navParams: NavParams, private modalCtrl: ModalController) { }

  ngOnInit() {
    this.eventDetails = this.navParams.get('event');
    this.formOptions = this.navParams.get('options');

    if (this.formOptions["Mode"] == "EDIT") {this.formEdit = true;}
    if (this.eventDetails["IconPath"]) {this.icon = this.eventDetails["IconPath"];}
  }

  async saveAndReturn() {
    await this.modalCtrl.dismiss(this.eventDetails);
  }

  async cancelAndReturn() {
    await this.modalCtrl.dismiss(null);
  }

}
