import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { ForumMessagePage } from './forum-message.page';

const routes: Routes = [
  {
    path: '',
    component: ForumMessagePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),	
    RouterModule.forChild(routes)
  ],
  declarations: [ForumMessagePage]
})
export class ForumMessagePageModule {}
