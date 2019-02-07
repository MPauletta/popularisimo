import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { DataServiceService } from './../data-service.service';
import { TranslateService } from '@ngx-translate/core';
import { PopTools } from './../pop-tools';
import { PopRoutes } from './../pop-routes';

@Component({
  selector: 'app-note-details',
  templateUrl: './note-details.page.html',
  styleUrls: ['./note-details.page.scss'],
})
export class NoteDetailsPage implements OnInit {
  notes: any;
  noteID: string;
  groupID: number = null;
  errorMessage: string;
  folderID: number = 0;
  folderName: string = "";
  formOptions = {"Mode":"ADD","Title":"","GroupID":null};
  sheetLabels: any = {};

  constructor(private router: Router, private rest: DataServiceService, private translate: TranslateService, 
    private popTools: PopTools, private popRoutes: PopRoutes) {

      this.translate.stream(['Al_SystemError','Message_NoteCreate','Folder_Main','Message_EditNote','Message_Saved','Delete_Text','Delete_Confirm','Delete_Button','Message_Successfull','All_BTN_Cancel']).subscribe(res => {
        this.sheetLabels = res;
        if (this.folderName == "") {this.folderName = this.sheetLabels["Folder_Main"];}
      });  
  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    let myParams = this.popRoutes.getCurrentParam();

    this.noteID = myParams.noteID;
    if (myParams.groupID) {this.groupID = myParams.groupID;}
    if (myParams.FolderID) {this.folderID = myParams.FolderID;}
    if (myParams.FolderName) {this.folderName = myParams.FolderName;}
    this.getNote(this.noteID);
  }

  goBack() {
    this.popRoutes.navigateBackwards();
  }

  getNote(strnoteID) {
    this.rest.getNote(strnoteID, this.groupID)
       .subscribe(
         note => this.parsNote(note),
         error =>  this.errorMessage = <any>error);
  }

  parsNote(note) {
    this.notes = note;
  }

  deleteNote() {
    this.popTools.showLoading();
    this.rest.deleteNote(this.groupID, this.noteID)
       .subscribe(
         response => this.parsDeleteResponse(response),
         error =>  this.errorParser(error));
  }
 
  parsDeleteResponse(response) {
    this.popTools.dismissLoading();
    this.popRoutes.navigateBackwards();
  }

  editNote() {
   let postString = "";  
   let thisFolderName = "";  
   let thisNote = {"Description":this.notes[0].Description,"PostText":this.notes[0].PostText,"FolderID":this.folderID,"FolderName":this.folderName,"PhotoLocation":"../../assets/imgs/note.png"};

   this.formOptions.Mode = "EDIT";
   this.formOptions.GroupID = this.groupID;
   this.formOptions.Title = this.sheetLabels["Message_EditNote"];
   let params = { "thisNote": thisNote, "options": this.formOptions };

   this.popRoutes.showModal("NoteEditorPage", params, (data) => {
    if (data) {
      delete data.PhotoLocation
      if (data.FolderName) {
        thisFolderName = data.FolderName;
        delete data.FolderName;
      }
      if (data.Description == this.notes[0].Description) {delete data.Description;}
      if (data.PostText == this.notes[0].PostText) {delete data.PostText;}
      if (data.folderID == this.folderID) {
        delete data.folderID;
      } else {
        this.folderID = data.folderID;
        this.folderName = thisFolderName;
      }

      for (var key in data) {
        if (postString != "") {postString = postString + "&";}
        postString = postString + key + "=" + data[key];
      }

//console.log(postString);
      this.popTools.showLoading();
      this.rest.patchNote(this.groupID,this.noteID,postString)
        .subscribe(
          response => this.parsEditResponse(response),
          error =>  this.errorParser(error));
    }
   });

  }

  newNote() {
   let postString = "";  
   let thisFolderName = "";  
   let thisNote = {"Description":"","PostText":"","FolderID":this.folderID,"FolderName":this.folderName,"PhotoLocation":"../../assets/imgs/note.png"};

   this.formOptions.Mode = "ADD";
   this.formOptions.GroupID = this.groupID;
   this.formOptions.Title = this.sheetLabels["Message_NoteCreate"];
   let params = { "thisNote": thisNote, "options": this.formOptions };

   this.popRoutes.showModal("NoteEditorPage", params, (data) => {
    if (data) {
      delete data.PhotoLocation
      if (data.FolderName) {
        thisFolderName = data.FolderName;
        delete data.FolderName;
      }
      for (var key in data) {
        if (postString != "") {postString = postString + "&";}
        postString = postString + key + "=" + data[key];
      }

//console.log(postString);
      this.popTools.showLoading();
      this.rest.newNote(this.groupID,data.FolderID,postString)
        .subscribe(
          response => this.parsNewResponse(response, data.FolderID, thisFolderName),
          error =>  this.errorParser(error));
    }
   });

  }

  parsEditResponse(response) {
    this.popTools.dismissLoading();
    if (response.rowsAffected[0]) {
      this.popTools.showToast(this.sheetLabels["Message_Saved"], null);
      setTimeout(() => {
        this.getNote(this.noteID);
      }, 6000);

    } else {
      this.popTools.showAlert(this.sheetLabels["Al_SystemError"],JSON.stringify(response));
    }
  }

  parsNewResponse(response,lngFolderID,strFolderName) {
    this.popTools.dismissLoading();
    if (response.rowsAffected[0]) {
      this.popTools.showToast(this.sheetLabels["Message_Successfull"], null);
      setTimeout(() => {
        this.showNote(response.ID, lngFolderID, strFolderName);
      }, 6000);
    } else {
      this.popTools.showAlert(this.sheetLabels["Al_SystemError"],JSON.stringify(response));
    }
  }

  showNote(lngNoteID,lngFolderID,strFolderName) {
   let params = { "noteID": lngNoteID, "groupID": this.groupID, "FolderID":lngFolderID, "FolderName":strFolderName };

   this.popRoutes.navigateForward('/note-details', params);
  }

  showDeletePrompt() {
      let buttons = [
        {
          text: this.sheetLabels["Delete_Button"],
          handler: data => {
            this.deleteNote();
          }
        },
        {
          text: this.sheetLabels["All_BTN_Cancel"],
          handler: data => {
            console.log('Cancel clicked');
          }
        }
      ];

      this.popTools.showAlertList(this.sheetLabels["Delete_Text"], this.sheetLabels["Delete_Confirm"], null, buttons);
  }

  errorParser(error) {
    this.errorMessage = <any>error;

    this.popTools.dismissLoading();
    let jsonError = JSON.parse(error)
    if (jsonError.code) {
      if (jsonError.code != "ITEM_NOT_FOUND") {this.popTools.showAlert(this.sheetLabels["Al_SystemError"],error);}
    } else {
      this.popTools.showAlert(this.sheetLabels["Al_SystemError"],error);
    }
  }

  emptyMethod() {

  }

  getItems(ev: any) {

  }

}
