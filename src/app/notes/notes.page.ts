import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { DataServiceService } from './../data-service.service';
import { TranslateService } from '@ngx-translate/core';
import { PopTools } from './../pop-tools';
import { PopRoutes } from './../pop-routes';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.page.html',
  styleUrls: ['./notes.page.scss'],
})
export class NotesPage implements OnInit {
  notes = [];
  lastNote: any;
  groupID: number = null;
  folderID: number = 0;
  folderName: string = "";
  separator: string = "";
  pageTitle: string = "Message_MyNotes";
  errorMessage: string;
  infiniteScroll: any;
  formOptions = {"Mode":"ADD","Title":"","GroupID":null};
  sheetLabels: any = {};

  constructor(private router: Router, private rest: DataServiceService, private translate: TranslateService, private popTools: PopTools, private popRoutes: PopRoutes) {

  }

  ngOnInit() {
    let myParams = this.popRoutes.getCurrentParam();

    this.separator = "";
    this.folderName = "";
    if (myParams) {
      if (myParams.groupID) {
        this.groupID = myParams.groupID;
        this.getNotes();
        this.pageTitle = "Message_ViewNotes";
      } else {
        this.getNotes();
        this.pageTitle = "Message_MyNotes";
      }
    } else {  
      this.getNotes();
    }
    this.translate.stream(['Al_SystemError','Message_NoteCreate','Folder_Main','Message_Successfull']).subscribe(res => {
      this.sheetLabels = res;
      if (this.folderName == "") {this.folderName = this.sheetLabels["Folder_Main"]; this.separator = ": ";}
    });
  }

  goBack() {
    this.popRoutes.navigateBackwards();
  }

  getNotes() {
    this.notes = [];
    this.rest.getNotes(this.groupID,null,null)
       .subscribe(
         notes => this.parsNotes(notes),
         error => this.stopInfinite(error));
  }

  parsNotes(notes) {
    notes.forEach(note => {
      this.lastNote = note.PostDate;
      note.Message = note.Description.substring(0, 100);
      this.notes.push(note);
    });

    if (this.infiniteScroll) {
       this.infiniteScroll.target.complete();
    }
  }

  loadFolderNotes(lngFolder) {
   this.notes = [];
   this.folderID = lngFolder;
   this.rest.getNotes(this.groupID,lngFolder,null)
       .subscribe(
         notes => this.parsNotes(notes),
         error =>  this.errorMessage = <any>error);
  }

  showNote(lngNoteID) {
   let params = { "noteID": lngNoteID, "groupID": this.groupID, "FolderID":this.folderID, "FolderName":this.folderName };

   this.popRoutes.navigateForward('/note-details', params);
  }

  newNote() {
   let postString = "";  
   let thisFolderName = "";  
   let thisNote = {"Description":"","PostText":"","FolderID":this.folderID,"FolderName":this.folderName,"PhotoLocation":"../../assets/imgs/note.png"};

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

      this.popTools.showLoading();
      this.rest.newNote(this.groupID,data.FolderID,postString)
        .subscribe(
          response => this.parsResponse(response, data.FolderID),
          error =>  this.errorParser(error));
    }
   });
  }

  parsResponse(response, thisFolderID) {
    this.popTools.dismissLoading();
    if (response.rowsAffected[0]) {
      this.popTools.showToast(this.sheetLabels["Message_Successfull"], null);
      setTimeout(() => {
        this.getNotes();
      }, 6000);
    } else {
      this.popTools.showAlert(this.sheetLabels["Al_SystemError"],JSON.stringify(response));
    }
  }

  errorParser(error) {
    this.errorMessage = <any>error;

    this.popTools.dismissLoading();
    let jsonError = JSON.parse(error)
    if (this.infiniteScroll) {
       this.infiniteScroll.target.complete();
       this.infiniteScroll.target.disabled = true;
    }
    if (jsonError.code) {
      if (jsonError.code != "ITEM_NOT_FOUND") {this.popTools.showAlert(this.sheetLabels["Al_SystemError"],error);}
    } else {
      this.popTools.showAlert(this.sheetLabels["Al_SystemError"],error);
    }
  }

  doInfinite(infiniteScroll) {
    this.infiniteScroll = infiniteScroll;

    if (this.lastNote) {
      var lastDate = this.lastNote;

      this.lastNote = null;
      this.rest.getNotes(this.groupID,this.folderID,lastDate)
         .subscribe(
           notes => this.parsNotes(notes),
           error => this.stopInfinite(error));	
    }
  }

  stopInfinite(error) {
    this.errorMessage = <any>error;
    if (this.infiniteScroll) {
      this.infiniteScroll.target.complete();
      this.infiniteScroll.target.disabled = true;
    }
  }

  ChooseFolder(): void {
    let params = { "userID": null, "groupID": this.groupID };

    this.popRoutes.showModal("FoldersPage", params, (data) => {
      if (data) {
        this.notes = [];
        this.separator = "";
        this.folderID = data["folderID"];
	      if (data["folderType"] == 1) {this.folderID = 0;}
        this.folderName = data["folderName"];
        if (data["folderName"]) {if (data["folderName"] != "") {this.separator = ": ";}}
        this.rest.getNotes(this.groupID,this.folderID,null)
          .subscribe(
            notes => this.parsNotes(notes),
            error =>  this.errorMessage = <any>error
        );
      }
    });
  }

  getItems(ev: any) {

  }

  emptyMethod() {

  }

}
