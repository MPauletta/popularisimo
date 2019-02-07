import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { DemoUtilsModule } from '../demo-utils/module';
import { CalendarModule } from 'angular-calendar';
import { MyCalendarPage } from './my-calendar.page';

const routes: Routes = [
  {
    path: '',
    component: MyCalendarPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CalendarModule,
    DemoUtilsModule,
    TranslateModule.forChild(),	
    RouterModule.forChild(routes)
  ],
  declarations: [MyCalendarPage]
})
export class MyCalendarPageModule {}
