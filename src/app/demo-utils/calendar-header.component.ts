import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CalendarEvent, CalendarDateFormatter, DAYS_OF_WEEK } from 'angular-calendar'; 
import { CustomDateFormatter } from './custom-date-formatter.provider';
import { isSameDay, isSameMonth } from 'date-fns';
import { CalendarEventAction, CalendarEventTimesChangedEvent } from 'angular-calendar';
import { DataServiceService } from './../data-service.service';
import { format } from 'date-fns'
import { PopTools } from './../pop-tools';
import { PopRoutes } from './../pop-routes';

@Component({
  selector: 'mwl-demo-utils-calendar-header',
  templateUrl: 'calendar.html',
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter
    }
  ]

})

export class CalendarHeaderComponent {
  leftBool: boolean = false; 
  middleBool: boolean = true; 
  rightBool: boolean = true; 
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  weekendDays: number[] = [DAYS_OF_WEEK.FRIDAY, DAYS_OF_WEEK.SATURDAY];
  formOptions = {"Mode":"ADD","Title":""};
  editEvent: any = {"ItemName":"", "ItemType":"", "Description":"", "Location":"", "Importance":0, "DateAdded":"", "Frequency":0, "EventStart":"", "EventStop":"", "ExpirationDate":"", "EventDate":"", "IconPath":"", "AccessType":0, "PhotoID":0, "ParentID":0, "OriginalOwner":0, "GroupID":0};
 
  activeDayIsOpen: boolean = false;

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fa fa-fw fa-pencil"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      }
    },
    {
      label: '<i class="fa fa-fw fa-times"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter(iEvent => iEvent !== event);
        this.handleEvent('Deleted', event);
      }
    }
  ];

  @Input() groupID: number = 0;
  @Input() view: string = 'month';
  @Input() viewDate: Date = new Date();
  @Input() locale: string = 'en';
  @Input() events: CalendarEvent[] = [];
  @Output() viewChange: EventEmitter<string> = new EventEmitter();
  @Output() viewDateChange: EventEmitter<Date> = new EventEmitter();
  @Output() newEvent: EventEmitter<Date> = new EventEmitter();

  constructor(private rest: DataServiceService, private popTools: PopTools, private popRoutes: PopRoutes) { }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
        this.viewDate = date;
      }
    }
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd
  }: CalendarEventTimesChangedEvent): void {
    event.start = newStart;
    event.end = newEnd;
    this.handleEvent('Dropped or resized', event);
//    this.refresh.next();
  }

  handleEvent(action: string, event: CalendarEvent): void {
    let postString = "";

    this.formOptions.Mode = "EDIT";
    this.editEvent.ItemName = event["ItemName"];
    this.editEvent.ItemType = event["ItemType"];
    this.editEvent.Description = event["Description"];
    this.editEvent.Location = event["Location"];
    this.editEvent.Importance = event["Importance"];
    this.editEvent.DateAdded = event["DateAdded"];
    this.editEvent.Frequency = event["Frequency"];
    this.editEvent.EventStart = event["EventStart"];
    this.editEvent.EventStop = event["EventStop"];
    this.editEvent.ExpirationDate = event["ExpirationDate"];
    this.editEvent.EventDate = event["EventDate"];
    this.editEvent.IconPath = event["IconPath"];
    this.editEvent.AccessType = event["AccessType"];
    this.editEvent.PhotoID = event["PhotoID"];
    this.editEvent.ParentID = event["ParentID"];
    this.editEvent.OriginalOwner = event["OriginalOwner"];
    let params = { "event": this.editEvent, "options": this.formOptions };

    this.popRoutes.showModal("EventDetailsPage", params, (data) => {
      if (data) {
        delete data.DateAdded;
        delete data.EventDate;
        delete data.ParentID;
        delete data.OriginalOwner;
        delete data.IconPath;
        if (data.ItemName == event["ItemName"]) {delete data.ItemName;} else {event["title"] = data.ItemName;}
        if (data.ItemType == event["ItemType"]) {delete data.ItemType;}
        if (data.Description == event["Description"]) {delete data.Description;}
        if (data.Location == event["Location"]) {delete data.Location;}
        if (data.Importance == event["Importance"]) {delete data.Importance;}
        if (data.Frequency == event["Frequency"]) {delete data.Frequency;}
        if (data.EventStart == event["EventStart"]) {delete data.EventStart;}
        if (data.EventStop == event["EventStop"]) {delete data.EventStop;}
        if (data.AccessType == event["AccessType"]) {delete data.AccessType;}
        if (data.PhotoID == event["PhotoID"]) {delete data.PhotoID;}
        if (data.ExpirationDate == event["ExpirationDate"]) {
          delete data.ExpirationDate;
        } else {
          data.ExpirationDate = format(data.ExpirationDate, 'YYYY-MM-DD')
        }

        for (var key in data) {
          if (postString != "") {postString = postString + "&";}
            postString = postString + key + "=" + data[key];
            event[key] = data[key];
          }
        if (postString != "") {
          this.popTools.showLoading();
          this.rest.patchEvent(event["ID"],this.groupID,postString).subscribe(
            response => this.parsResponse(false,response),
            error =>  this.errorNotification(error)
          );
        }
      }
    });
  }

  newClicked(): void {
    let postString = "";

    this.formOptions.Mode = "ADD";
    this.editEvent.ItemName = "";
    this.editEvent.ItemType = 1;
    this.editEvent.Description = "";
    this.editEvent.Location = "";
    this.editEvent.Importance = 0;
    this.editEvent.DateAdded = null;
    this.editEvent.Frequency = 0;
    this.editEvent.EventStart = "00:00";
    this.editEvent.EventStop = "00:00";
    this.editEvent.ExpirationDate = null;
    this.editEvent.EventDate = format(this.viewDate, 'MM/DD/YYYY');
    this.editEvent.IconPath = "../../assets/imgs/Group_Meeting_Dark.png";
    this.editEvent.AccessType = 0;
    this.editEvent.PhotoID = 0;
    this.editEvent.ParentID = 0;
    this.editEvent.OriginalOwner = 0;
    let params = { "event": this.editEvent, "options": this.formOptions };

    this.popRoutes.showModal("EventDetailsPage", params, (data) => {
      if (data) {
        delete data.IconPath;
        if (!data.ExpirationDate) {delete data.ExpirationDate;}

        for (var key in data) {
          switch(key) {
            case "DateAdded":
            case "ParentID":
            case "OriginalOwner":
              break;
            default:	
              if (postString != "") {postString = postString + "&";}
              postString = postString + key + "=" + data[key];
              event[key] = data[key];
          }
        }
        if (postString != "") {
          this.popTools.showLoading();
          this.rest.newEvent(this.groupID,postString).subscribe(
            response => this.parsResponse(true,response),
            error =>  this.errorNotification(error)
          );
        }
      }
    });
  }
  
  parsResponse(blnNewData, response) {
    this.popTools.dismissLoading();

    if (response.rowsAffected[0]) {
      this.newEvent.next();

      this.popTools.showToast("Process Completed Successfully.", null);
    } else {
      this.popTools.showToast(JSON.stringify(response), null);
    }
  }

  errorNotification(error) {
    this.popTools.dismissLoading();

    this.popTools.showToast(error, null);
  }

}

