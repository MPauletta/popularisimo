import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { SelectFriendsPage } from './select-friends.page';

const routes: Routes = [
  {
    path: '',
    component: SelectFriendsPage
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
  declarations: [SelectFriendsPage]
})
export class SelectFriendsPageModule {}
