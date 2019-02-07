import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { NavParams, ModalController  } from '@ionic/angular';
import { DataServiceService } from './../data-service.service';

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.page.html',
  styleUrls: ['./product-edit.page.scss'],
})
export class ProductEditPage implements OnInit {
  productDetails: any;
  formOptions: any;
  icon: string = "";
  title: string = "";
  formEdit: boolean = false;
  errorMessage: string;
  countries: any;
  currencies: any;
  usages: any;
  categories: any;
  subcategories: any;

  constructor(private zone: NgZone, private changeRef: ChangeDetectorRef, private navParams: NavParams, private modalCtrl: ModalController, private rest: DataServiceService) { }

  ngOnInit() {
    this.getCountries();
    this.getCurrencies();
    this.getUsages();
//	this.zone.run(async () => {
      this.getCategories();
//	});
    this.getSubCategories(this.navParams.get('product').Category);	  
  }

  ionViewDidEnter() {
	this.productDetails = this.navParams.get('product');
	this.formOptions = this.navParams.get('options');
	this.icon = this.productDetails.PhotoLocation;
	this.title = this.formOptions.Title;
    if (this.formOptions.Mode == "EDIT") {this.formEdit = true;}	  
  }
  
  getCountries() {
    this.rest.getProductPropertyList("countries")
      .subscribe(
        items => this.countries = items,
        error =>  this.errorMessage = <any>error);
  }
  
  getCurrencies() {
    this.rest.getProductPropertyList("currencies")
      .subscribe(
        items => this.currencies = items,
        error =>  this.errorMessage = <any>error);
  }
  
  getUsages() {
    this.rest.getProductPropertyList("usages")
      .subscribe(
        items => this.usages = items,
        error =>  this.errorMessage = <any>error);
  }
  
  getCategories() {
    this.rest.getProductPropertyList("categories")
      .subscribe(
        items => this.detectChanges(items),
        error =>  this.errorMessage = <any>error);
  }
  
  detectChanges(items) {
	this.categories = items
//	this.changeRef.detectChanges();
  }
  
  getSubCategories(parent) {
    this.rest.getProductPropertyList2("subcategories", parent)
      .subscribe(
        items => this.subcategories = items,
        error =>  this.errorMessage = <any>error);
  }
  
  async saveAndReturn() {
    await this.modalCtrl.dismiss(this.productDetails);
  }

  async cancelAndReturn() {
//console.log(this.productDetails);	  
//console.log(this.categories[2]);	  
//console.log(this.categories[2].ID);	  
    await this.modalCtrl.dismiss(null);
  }

  changeSubCategories(parent) {
//console.log(parent);	  
    this.productDetails.SubCategory = 1;
    this.rest.getProductPropertyList2("subcategories", parent)
      .subscribe(
        items => this.subcategories = items,
        error =>  this.errorMessage = <any>error);
  }

}
