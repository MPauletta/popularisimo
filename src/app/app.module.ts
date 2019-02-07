import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { IonicStorageModule } from '@ionic/storage';
import { AuthInterceptor } from './auth-interceptor';
import { environment } from './../environments/environment';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { DemoUtilsModule } from './demo-utils/module';

import { Camera } from '@ionic-native/camera/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

import { FileOpener } from '@ionic-native/file-opener/ngx';
import { DocumentViewer } from '@ionic-native/document-viewer/ngx';

import { PopTools } from './pop-tools';
import { PopRoutes } from './pop-routes';
import { CommentAddPageModule } from './comment-add/comment-add.module';
import { SelectMyResourcePageModule } from './select-my-resource/select-my-resource.module';
import { ShowLikesPageModule } from './show-likes/show-likes.module';
import { CustomToastPageModule } from './custom-toast/custom-toast.module';
import { GroupEditPageModule } from './group-edit/group-edit.module';
import { ProductEditPageModule } from './product-edit/product-edit.module';
import { AppStoragePageModule } from './app-storage/app-storage.module';
import { UploadModalPageModule } from './upload-modal/upload-modal.module';
import { FoldersPageModule } from './folders/folders.module';
import { SelectFriendsPageModule } from './select-friends/select-friends.module';
import { MessageEditorPageModule } from './message-editor/message-editor.module';
import { NoteEditorPageModule } from './note-editor/note-editor.module';
import { ForumMessageEditorPageModule } from './forum-message-editor/forum-message-editor.module';
import { EventDetailsPageModule } from './event-details/event-details.module';
import { UserAddressPageModule } from './user-address/user-address.module';
import { UserInfoPageModule } from './user-info/user-info.module';
import { UserPrivacyPageModule } from './user-privacy/user-privacy.module';
import { UserSecurityPageModule } from './user-security/user-security.module';
import { WatchListPageModule } from './watch-list/watch-list.module';

const config: SocketIoConfig = { url: environment.socketserverurl, options: {} };

export function customTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [AppComponent],
  entryComponents: [ ],
  imports: [
    BrowserModule,
	BrowserAnimationsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: customTranslateLoader,
        deps: [HttpClient]
      }
    }),	
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),	
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    DemoUtilsModule,
    SocketIoModule.forRoot(config),
    AppRoutingModule,
    CommentAddPageModule,
    SelectMyResourcePageModule,
    ShowLikesPageModule,
    CustomToastPageModule,
    GroupEditPageModule,
    ProductEditPageModule,
    AppStoragePageModule,
    UploadModalPageModule,
    FoldersPageModule,
    SelectFriendsPageModule,
    MessageEditorPageModule,
    NoteEditorPageModule,
    ForumMessageEditorPageModule,
    EventDetailsPageModule,
    UserAddressPageModule,
    UserInfoPageModule,
    UserPrivacyPageModule,
    UserSecurityPageModule,
    WatchListPageModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
	File,
    FileTransfer,
    FileOpener,
    DocumentViewer,	
    Camera,
    WebView,
	PopTools,
	PopRoutes,
	{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
