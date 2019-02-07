import { registerLocaleData } from '@angular/common';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import localeEx from './lang/ex';
import localePa from './lang/pa';
import { CalendarModule } from 'angular-calendar';
import { CalendarHeaderComponent } from './calendar-header.component';
import { DateTimePickerComponent } from './date-time-picker.component';
import { TranslateModule } from '@ngx-translate/core';

registerLocaleData(localeEx);
registerLocaleData(localePa);

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CalendarModule,
    TranslateModule.forChild()
  ],
  declarations: [CalendarHeaderComponent, DateTimePickerComponent],
  exports: [CalendarHeaderComponent, DateTimePickerComponent]
})

export class DemoUtilsModule { }

