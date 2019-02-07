import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform, ActionSheetController} from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthServiceService } from './auth-service.service';
import { UserDataService } from './user-data.service';
import { TranslateService } from '@ngx-translate/core';
import { PopTools } from './pop-tools';
import { PopRoutes } from './pop-routes';

export interface PageInterface {
  title: string;
  pageName: string;
  url?: string;
  tabComponent?: any;
  index?: number;
  resource?: number;
  icon: string;
  badge?: string;
  itemColor: string;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
  formOptions = {"Mode":"ADD", "Title":"", "Icon":""};
  sheetLabels: any = {};

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
    private authenticationService: AuthServiceService,
    private UserData: UserDataService,
    private translate: TranslateService,
    private popTools: PopTools,
    private popRoutes: PopRoutes
    ) {
      this.initializeApp();	
      this.translate.addLangs(["en", "es", "pa"]);
//     let userLang = navigator.language.split('-')[0];
//     userLang = /(en|de|du|it|fr|es|be|pa)/gi.test(userLang) ? userLang : 'en';
//     this.translate.use(userLang);	

      this.translate.setDefaultLang('es');
      this.translate.use('es');	
      this.translate.stream(['All_Choose_Lang','All_BTN_Cancel','Product_My','Main_My_Groups','Calendar_Loading']).subscribe(res => {
      this.sheetLabels = res;
    });	 
  }

  initializeApp() {
    var strMessage = "";
    var lngCount = 0;
    var parameter = 0;

    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

console.log('============ App Initialized =================');	  
      this.authenticationService.authenticationState.subscribe(state => {
        if (state) {
          this.popRoutes.setRoot('/tabs/my-portal', null);
        }
      });
 	  
    });
  }
  
  ngOnInit() {

  }
  
  setLanguage(strLanguage) {
   this.translate.use(strLanguage);
  }

  openPage(page: PageInterface) {
    let params = {};
    
	  if (page.pageName == "LogOut") {
	    this.authenticationService.logout();
	    this.router.navigate(['/login']);
    } else if (page.pageName == 'Main_Language') {
      this.presentActionSheet();
    } else if (page.title == "Market_Name") {
      params = { memberID: this.UserData.currentUser.user_id, groupID: 0, Fullname: this.sheetLabels["Product_My"] };
      this.popRoutes.setRoot(page.url, params);
    } else if (page.title == "Main_Groups") {
      params = { memberID: this.UserData.currentUser.user_id, Fullname: this.sheetLabels["Main_My_Groups"] };
      this.popRoutes.setRoot(page.url, params);
    } else if (page.title == "Member_MyPortal") {
      this.popRoutes.setRoot(page.url, params);
    } else if (page.title == "Chat_Chat") {
      this.popRoutes.setRoot(page.url, params);
	  } else {	
      this.popRoutes.navigateForward(page.url, null);
	  }
  }

  async presentActionSheet() {   
      let buttons = [{
        text: 'English',
        icon: 'eye',
        handler: () => {
          this.setLanguage('en');
        }
      }, {
        text: 'Español',
        icon: 'eye',
        handler: () => {
          this.setLanguage('es');
        }
      }, {
        text: 'Papiamentu',
        icon: 'eye',
        handler: () => {
          this.setLanguage('pa');
        }
      }, {
        text: this.sheetLabels["All_BTN_Cancel"],
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }];
    this.popTools.showActionSheet(this.sheetLabels["All_Choose_Lang"], buttons);
  }

}
