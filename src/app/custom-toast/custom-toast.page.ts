import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-custom-toast',
  templateUrl: './custom-toast.page.html',
  styleUrls: ['./custom-toast.page.scss'],
})
export class CustomToastPage implements OnInit {
  icon: string = "";
  title: string = "";
  buttonText: string = "";
  blnClosing: boolean = false;

  constructor(private modalController: ModalController, private navParams: NavParams) { }

  ngOnInit() {
	  let params = this.navParams.get('message');
	
    this.icon = params.PhotoLocation;
    this.title = params.Title;
    this.buttonText = params.ButtonText;
    setTimeout(() => {
      if (!this.blnClosing) {
        this.cancelReturn();
      }
    }, 5000);
  }
  
  async okReturn() {
    if (!this.blnClosing) {
      this.blnClosing = true;
      await this.modalController.dismiss({"ActionOk": true});
    }
  }

  async cancelReturn() {
    if (!this.blnClosing) {
      this.blnClosing = true;
      await this.modalController.dismiss({"ActionOk": false});
    }
  }  

}
