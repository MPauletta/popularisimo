import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController  } from '@ionic/angular';
import { FoldersPage } from './../folders/folders.page';

@Component({
  selector: 'app-note-editor',
  templateUrl: './note-editor.page.html',
  styleUrls: ['./note-editor.page.scss'],
})
export class NoteEditorPage implements OnInit {
  txtPostText: string = "";
  txtDescription: string = "";
  errorMessage: string;
  groupID: number = null;
  folderID: number = 0;
  folderName: string = "";
  formOptions: any;
  icon: string = "../../assets/imgs/note.png";
  title: string = "";
  formEdit: boolean = false;
  noteDetails = {"Description":"","PostText":"","PhotoLocation":"","FolderID":0,"FolderName":""};


  constructor(private navParams: NavParams, private modalCtrl: ModalController) {
  }

  ngOnInit() {
    this.formOptions = this.navParams.get('options');
    this.title = this.formOptions.Title;
    if (this.formOptions.Mode == "EDIT") {this.formEdit = true;}
    if (this.formOptions.GroupID) {this.groupID = this.formOptions.GroupID;}

    this.noteDetails = this.navParams.get('thisNote');
    this.txtDescription = this.noteDetails.Description;
    this.txtPostText = this.noteDetails.PostText;
    this.folderID = this.noteDetails.FolderID;
    this.folderName = this.noteDetails.FolderName;
    this.icon = this.noteDetails.PhotoLocation;
  }

  async ChooseFolder()  {
    let params = { "userID": null, "groupID": this.groupID };
    const formModal = await this.modalCtrl.create({
      component: FoldersPage,
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

   	    this.folderID = data["folderID"];
	      if (data["folderType"] == 1) {this.folderID = 0;}
	      this.folderName = data["folderName"];
      }
    });
    await formModal.present();	      
  }

  async completeAndReturn() {
    let element = document.getElementById("myInputDiv");

    this.noteDetails.PostText = element.innerHTML;
    this.noteDetails.Description = this.txtDescription;
    this.noteDetails.FolderID = this.folderID;
    this.noteDetails.FolderName = this.folderName;
    await this.modalCtrl.dismiss(this.noteDetails);
  }

  async cancelAndReturn() {
    await this.modalCtrl.dismiss(null);
  }

}
