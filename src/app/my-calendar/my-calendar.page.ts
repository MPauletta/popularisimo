import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { DataServiceService } from './../data-service.service';
import { TranslateService } from '@ngx-translate/core';
import { PopTools } from './../pop-tools';
import { PopRoutes } from './../pop-routes';
import { getMonth, getDate, getHours, differenceInCalendarMonths, differenceInCalendarYears, endOfMonth, endOfWeek, endOfDay, setDate, addHours, setHours, setMinutes, setSeconds, addMinutes, getMinutes } from 'date-fns';
import { CalendarEvent } from 'angular-calendar';
import { colors } from '../demo-utils/colors';
import RRule from 'rrule';

@Component({
  selector: 'app-my-calendar',
  templateUrl: './my-calendar.page.html',
  styleUrls: ['./my-calendar.page.scss'],
})
export class MyCalendarPage implements OnInit {
  groupID: number;
  errorMessage: string;
  view: string = 'month';
  viewDate: Date = new Date();
  locale: string = 'en';
  arrColors: any = [colors.red, colors.blue, colors.yellow, colors.green, colors.gray, colors.maroon, colors.purple, colors.brown, colors.orange, colors.pink];
  actions: any = [];
  generatedMonths: any = {};
  startDate: Date = new Date();
  showEvent: boolean = false;
  strTemp: string = '';
  lngTemp: number = 0;
  lngTemp2: number = 0;
  lngTemp3: number = 0;

  calendarEvents: CalendarEvent[] = [];
  recurringEvents: any = {};

  constructor(private router: Router, private rest: DataServiceService, private translate: TranslateService, 
    private popTools: PopTools, private popRoutes: PopRoutes) {

  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.groupID = 0;
    if (this.translate.currentLang == "es") {
	    this.locale = "ex";
    } else if (this.translate.currentLang == "pa") {
	    this.locale = "pa";
    } else {
	    this.locale = "en";
    }
    this.popTools.showLoading();
    this.getEvents();
  }

  goBack() {
    this.popRoutes.navigateBackwards();
  }

  getEvents() {
    this.rest.getEvents()
       .subscribe(
         events => this.mapCalendarEvents(events),
         error =>  this.errorNotification(error));
  }

  selectCalendarEvents(viewDate): void {
    var parts = [];
    var endDate = new Date();
    var timeFrame = {};

    this.calendarEvents = [];
    const endOfPeriod: any = {
      month: endOfMonth,
      week: endOfWeek,
      day: endOfDay
    };

    if (!this.recurringEvents.length) {this.popTools.dismissLoading(); return;}
    this.recurringEvents.forEach(event => {
      // Select only events that have not expired
      this.showEvent = false;
      if (event.rrule.until) {
        this.lngTemp = differenceInCalendarMonths(this.viewDate, event.rrule.until)
	      if (this.lngTemp <= 0) {this.showEvent = true;}
      } else {
	      this.showEvent = true;
      }

      // Select only events that have already started.
      this.lngTemp = differenceInCalendarMonths(this.viewDate, event.rrule.dtstart)
      this.lngTemp2 = differenceInCalendarYears(this.viewDate, event.rrule.dtstart)
      if (this.lngTemp2 < 0) {
	      this.showEvent = false;
      } else if ((this.lngTemp2 = 0) || (this.lngTemp2 = 1)) {
	      if (this.lngTemp < 0) {this.showEvent = false;}
      }

      // Check if the event can be displayed in the current calendar month.
      if (this.showEvent) {
        this.showEvent = false;
	      if (event.rrule.freq == 3) {this.showEvent = true;} 	// Daily
	      if (event.rrule.freq == 2) {this.showEvent = true;} 	// Weekly
	      if (event.rrule.freq == 1) {this.showEvent = true;} 	// Monthly
	      if (event.rrule.byweekday) {
 	  // Weekly Frequency
          if (isNaN(event.rrule.byweekday) && !Array.isArray(event.rrule.byweekday)) {
            event.rrule.byweekday = JSON.parse("[" + event.rrule.byweekday + "]");
          }
        }
        this.lngTemp = getMonth(event.rrule.dtstart);
        this.lngTemp2 = getMonth(this.viewDate);
        if ((event.rrule.freq == 0) && (this.lngTemp == this.lngTemp2)) { 	// One Time Or Yearly in current month
          if (event.rrule.until) {
            this.showEvent = true;
          } else if (event.rrule.count) {
            this.lngTemp = differenceInCalendarYears(viewDate, event.rrule.dtstart) + 1
            this.lngTemp = this.lngTemp - event.rrule.count
            if ((event.rrule.count > 0) && (this.lngTemp <= event.rrule.count)) {this.showEvent = true;}
          }
        } 

        if (this.showEvent) {
          if (event.rrule.freq == 0) {
            this.lngTemp = getDate(event.rrule.dtstart);
          } else {
            this.lngTemp = 1;
          }
          this.lngTemp2 = getHours(event.rrule.dtstart);
          this.lngTemp3 = getMinutes(event.rrule.dtstart);
          this.startDate = setDate(this.viewDate, this.lngTemp)
          this.startDate = setHours(this.startDate,this.lngTemp2)
          this.startDate = setMinutes(this.startDate,this.lngTemp3)
          this.startDate = setSeconds(this.startDate,0)

          const rule: RRule = new RRule(
            Object.assign({}, event.rrule, {
              dtstart: this.startDate,
              until: endOfPeriod[this.view](this.viewDate)
            })
          );
    
          rule.all().forEach(date => {
            if (event.Elapse) {
              parts = event.Elapse.toString().split(':');
              endDate = addHours((new Date(date)), parts[0]);
              if (parts.length > 1) {endDate = addMinutes(endDate, parts[1]);}
              timeFrame = {start: new Date(date), end: endDate};
            } else {
              timeFrame = {start: new Date(date), end: addHours((new Date(date)), 1)};
            }

            this.calendarEvents.push(
              Object.assign({}, event, timeFrame)
            );
          });

        }
      }
    })
    this.popTools.dismissLoading();
  }

  mapCalendarEvents(listEvents): void {
    listEvents.forEach(event => {

      event.color = this.arrColors[event.color];
      event.rrule.dtstart = eval("(" + event.rrule.dtstart + ")");
      if (event.rrule.until) {
        event.rrule.until = eval("(" + event.rrule.until + ")");
      }
      
      event.actions = this.actions;
    });
    this.recurringEvents = listEvents;
    this.selectCalendarEvents(this.viewDate);
  }
 
  calendarViewDateChanged() {
    this.popTools.showLoading();
    if (Object.keys(this.recurringEvents).length = 0) {
      this.getEvents();
    } else {
      this.selectCalendarEvents(this.viewDate);
    }   
  }

  newEvent() {
    this.getEvents();
  }

  errorNotification(error) {
    this.errorMessage = <any>error;

    this.popTools.dismissLoading();
  }

}
