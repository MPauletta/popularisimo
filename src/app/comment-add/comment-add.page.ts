import { Component, OnInit } from '@angular/core';
import { NavParams, ActionSheetController, ModalController  } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { SelectMyResourcePage } from './../select-my-resource/select-my-resource.page';

@Component({
  selector: 'app-comment-add',
  templateUrl: './comment-add.page.html',
  styleUrls: ['./comment-add.page.scss'],
})
export class CommentAddPage implements OnInit {
  showObject: boolean = false;
  objectLocation: string = "";
  objectLabel: string = "";
  icon: string = "../../assets/imgs/note.png";
  title: string = "";
  postData: any = {NoteText: "", ObjectType: 0, ObjectID:0};

  sheetLabels: any = {"All_BTN_Cancel":"Cancel","Social_PhotoOptions":"Social_PhotoOptions","All_PhotoSelect":"All_PhotoSelect","Social_NewPhoto":"Social_NewPhoto",
		"Social_VideoOptions":"Social_VideoOptions","All_VideoSelect":"All_VideoSelect","Social_NewVideo":"Social_NewVideo","Social_DocOptions":"Social_DocOptions",
		"All_DocSelect":"All_DocSelect","Social_NewDocument":"Social_NewDocument","All_UseExternalLink":"All_UseExternalLink"};

  constructor(private navParams: NavParams, private actionSheetCtrl: ActionSheetController, private modalCtrl: ModalController, private translate: TranslateService) {
  }

  ngOnInit() {
    this.translate.stream(['All_BTN_Cancel','Social_PhotoOptions','All_PhotoSelect','Social_NewPhoto','Social_VideoOptions','All_VideoSelect',
				'Social_NewVideo','Social_DocOptions','All_DocSelect','Social_NewDocument','All_UseExternalLink']).subscribe(res => {
      this.sheetLabels = res;
    });
    this.title = this.navParams.get('options').Title;
  }

  async saveAndReturn() {
    let element = document.getElementById("myInputDiv");

    if (element.innerHTML != null) {
      this.postData.NoteText = element.innerHTML;
    } else {
      this.postData = null;
    }	
    await this.modalCtrl.dismiss(this.postData);
  }

  async cancelAndReturn() {
    await this.modalCtrl.dismiss(null);
  }

  async selectResource(indexResource, formTitle) {
    let modalOptions = {"Mode":"EDIT","Title":formTitle, returnFull:true};
    let params = { "resourceIndex": indexResource, "options": modalOptions };

    const formModal = await this.modalCtrl.create({
      component: SelectMyResourcePage,
	  cssClass: "my-modal",
	  showBackdrop: true,
      componentProps: params
    });
    formModal.onDidDismiss().then((data) => {
      if (data) {
        // When you click outside the modal it returns: {"role":"backdrop"}
        if (data["role"]) {if (data["role"] == "backdrop") {data = null;}}
      }
      if (data) {
        // Sometimes the data is incapsulated into a data key: {"data":null} or {"data":{"item":"Someting"}}}
        if (("data" in data)) {data = data["data"];}
      }

      if (data) {
		this.objectLocation = data["Location"];
		this.postData.ObjectType = indexResource;
		this.postData.ObjectID = data["ID"];
		this.showObject = true;
		this.objectLabel = data["Description"];
      }
    })   
    await formModal.present();	      
  }

  async presentActionSheet(lngItem) {
    var strTitle = this.sheetLabels.Social_PhotoOptions; 
    var strSelect = this.sheetLabels.All_PhotoSelect; 
    var strLoad = this.sheetLabels.Social_NewPhoto;

    if (lngItem == 2) {
      strTitle = this.sheetLabels.Social_VideoOptions;
      strSelect = this.sheetLabels.All_VideoSelect;
      strLoad = this.sheetLabels.Social_NewVideo;
    } else if (lngItem == 3) {
      strTitle = this.sheetLabels.Social_DocOptions;
      strSelect = this.sheetLabels.All_DocSelect;
      strLoad = this.sheetLabels.Social_NewDocument;
    }
   
    const actionSheet = await this.actionSheetCtrl.create({
      header: strTitle,
      buttons: [{
        text: strSelect,
        icon: 'eye',
        handler: () => {
          this.selectResource(lngItem, strSelect);
        }
      }, {
        text: strLoad,
        icon: 'camera',
        handler: () => {
          this.emptyMethod();
        }
      }, {
        text: this.sheetLabels.All_UseExternalLink,
        icon: 'globe',
        handler: () => {
          this.emptyMethod();
        }
      }, {
        text: this.sheetLabels.All_BTN_Cancel,
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    await actionSheet.present();   
   
  }

  emptyMethod() {

  }
}
