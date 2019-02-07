import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { PopRoutes } from './../pop-routes';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.page.html',
  styleUrls: ['./pdf-viewer.page.scss'],
})
export class PdfViewerPage implements OnInit {
  pdfSrc: string = '';

  constructor(private popRoutes: PopRoutes, private platform: Platform, private file: File, private ft: FileTransfer, 
    private fileOpener: FileOpener, private document: DocumentViewer) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    let myParams = this.popRoutes.getCurrentParam();
    this.pdfSrc = myParams["pdfSrc"];
  }

  goBack() {
    this.popRoutes.navigateBackwards();
  }

  downloadAndOpenPdf() {
    let downloadUrl = 'https://devdactic.com/html/5-simple-hacks-LBT.pdf';
    let path = this.file.dataDirectory;
    const transfer = this.ft.create();
 
    transfer.download(this.pdfSrc, path + 'myfile.pdf').then(entry => {
     let url = entry.toURL();
 
     if (this.platform.is('ios')) {
       this.document.viewDocument(url, 'application/pdf', {});
     } else {
       this.fileOpener.open(url, 'application/pdf')
        .then(() => console.log('File is opened'))
        .catch(e => console.log('Error opening file', e));
     }
    });
  }  
  
}
