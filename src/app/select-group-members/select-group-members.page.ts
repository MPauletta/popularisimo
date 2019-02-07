import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController  } from '@ionic/angular';
import { DataServiceService } from './../data-service.service';

@Component({
  selector: 'app-select-group-members',
  templateUrl: './select-group-members.page.html',
  styleUrls: ['./select-group-members.page.scss'],
})
export class SelectGroupMembersPage implements OnInit {
  groupMembers = [];
  lastGroupMember: any;
  groupID: number;
  groupFullname: string;
  infiniteScroll: any;
  errorMessage: string;
  formOptions: any;
  icon: string = "../../assets/imgs/Group_Meeting_Dark.png";

  constructor(private navParams: NavParams, private modalCtrl: ModalController, private rest: DataServiceService) { }

  ngOnInit() {
// ******************************************************
// ******* This Page is not tested yet ******************
// ******************************************************

    this.formOptions = this.navParams.get('options');
    this.groupMembers = [];
    this.groupID = 0;
    this.groupFullname = "";
    if (this.navParams.data.groupID) {this.groupID = this.navParams.data.groupID;}    
    if (this.navParams.data.Fullname) {
	this.groupFullname = this.navParams.data.Fullname;
    }    
    this.getGroupMembers();	
  }

  getGroupMembers() {
    this.rest.getGroupMembers(this.groupID,null)
       .subscribe(
         groupMembers => this.parsGroupMembers(groupMembers),
         error =>  this.errorMessage = <any>error);
  }

  parsGroupMembers(groupMembers) {
    groupMembers.forEach(member => {
	this.lastGroupMember = member.memberSince;
        this.groupMembers.push(member);
    });
  }

  errorParser(error) {
    this.errorMessage = <any>error;

    if (this.infiniteScroll) {
       this.infiniteScroll.target.complete();
       this.infiniteScroll.target.disabled = true;
    }
  }

  doInfinite(infiniteScroll) {
    this.infiniteScroll = infiniteScroll;

    if (this.lastGroupMember) {
      var lastDate = this.lastGroupMember;

      this.lastGroupMember = null;
      this.rest.getGroupMembers(this.groupID,lastDate)
         .subscribe(
           groupMembers => this.parsGroupMembers(groupMembers),
           error =>  this.errorParser(error));	
    }
  }
  
  async selectAndReturn(lngID, strName) {
    let selected = {"memberID":lngID, "memberName":strName};

    await this.modalCtrl.dismiss(selected);
  }

  async cancelAndReturn() {
    await this.modalCtrl.dismiss(null);
  }

  emptyMethod() {

  }

  getItems(ev: any) {

  }

}
