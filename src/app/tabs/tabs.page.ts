import { Component } from '@angular/core';
import { PopRoutes } from './../pop-routes';
import { UserDataService } from './../user-data.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})

export class TabsPage {

  constructor(private UserData: UserDataService, private popRoutes: PopRoutes) {}

  activateTab(url) {
    var params = null;
    var strUrl = "/tabs/" + url;

    if (url == "market") {
      params = { memberID: this.UserData.currentUser.user_id, groupID: 0, Fullname: '' };
    } else if (url == "groups") {
      params = { memberID: this.UserData.currentUser.user_id, Fullname: '' };
    }
    this.popRoutes.setRoot(strUrl, params);
  }
}
