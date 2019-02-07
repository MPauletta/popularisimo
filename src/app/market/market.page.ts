import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { DataServiceService } from './../data-service.service';
import { TranslateService } from '@ngx-translate/core';
import { PopTools } from './../pop-tools';
import { PopRoutes } from './../pop-routes';

@Component({
  selector: 'app-market',
  templateUrl: './market.page.html',
  styleUrls: ['./market.page.scss'],
})
export class MarketPage implements OnInit {
  products = [];
  lastProduct: any;
  memberID: number;
  groupID: number;
  memberFullname: string;
  pageTitle: string;
  infiniteScroll: any;
  formOptions = {"Mode":"ADD","Title":""};
  productEdit = {"Title":"", "Category":0, "SubCategory":0, "MinPrice":0, "Description": "", "Brand":"", "Country":"", "PhotoLocation":"", "Currency":""};
  errorMessage: string;
  sheetLabels: any = {};

  constructor(private router: Router, private rest: DataServiceService, private translate: TranslateService, 
    private popTools: PopTools, private popRoutes: PopRoutes) { 

  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    let myParams = this.popRoutes.getCurrentParam();

    this.products = [];
    this.memberID = 0;
    this.groupID = 0;
    this.memberFullname = "";
    if (myParams) {
      if (myParams.memberID) {this.memberID = myParams.memberID;}    
      if (myParams.groupID) {this.groupID = myParams.groupID;}    
      if (myParams.Fullname) {
	      this.memberFullname = myParams.Fullname;
        this.pageTitle = ": " + this.memberFullname;
      } else {
	      this.pageTitle = "";
      }
    } else {
      this.pageTitle = "";
    }

    this.getProducts();
    this.translate.stream(['Market_Products','Group_ForumToSmall','Market_ProductOption','Market_ViewProduct', 'Market_ViewOwner',
			'Group_View','Market_ProductLike','Social_CommentView','Product_New','All_Wait','Al_SystemError',
			'Add_Message',"All_Group","All_Personal","Market_Ask_New_Product",'All_BTN_Cancel','All_Product',
			'All_CannotContinue','errManInvalidAccess','All_AccessDenied','All_Item_Not_Found','Social_AlreadyLiked',
			'Social_MemberLike','All_Like','All_DontLike','All_Sow_Likes','Social_LikeSet']).subscribe(res => {

      this.sheetLabels = res;
    });
  }

  goBack() {
    this.popRoutes.navigateBackwards();
  }

  getProducts() {
    this.rest.getProducts(this.memberID,this.groupID,null)
       .subscribe(
         products => this.parsProducts(products),
         error =>  this.errorMessage = <any>error);
  }

  parsProducts(products) {
    products.forEach(product => {
	    this.lastProduct = product.DateAdded;
      this.products.push(product);
    });

    if (this.infiniteScroll) {
       this.infiniteScroll.target.complete();
    }
  }

  showProduct(lngProductID) {
   let params = { productID: lngProductID, groupID: this.groupID };

   this.popRoutes.navigateForward('/product', params);
  }

  async presentActionSheet(productID, lngIndex) {
    let buttons = [{
      text: this.sheetLabels["Market_ViewProduct"],
      icon: 'eye',
      handler: () => {
        this.showProduct(productID);
      }
    }, {
      text: this.sheetLabels["Market_ViewOwner"],
      icon: 'contacts',
      handler: () => {
        this.emptyMethod();
      }
    }, {
      text: this.sheetLabels["Market_ProductLike"],
      icon: 'happy',
      handler: () => {
        this.showAddLikePrompt(lngIndex);
      }
    }, {
      text: this.sheetLabels["Social_CommentView"],
      icon: 'text',
      handler: () => {
        this.showObject(lngIndex);
      }
    }, {
      text: this.sheetLabels.All_BTN_Cancel,
      icon: 'close',
      role: 'cancel',
      handler: () => {
        console.log('Cancel clicked');
      }
    }];

   this.popTools.showActionSheet(this.sheetLabels["Market_ProductOption"], buttons);
  }
  
  doInfinite(infiniteScroll) {
    this.infiniteScroll = infiniteScroll;

    if (this.lastProduct) {
      var lastDate = this.lastProduct;

      this.lastProduct = null;
      this.rest.getProducts(this.memberID,this.groupID,lastDate)
         .subscribe(
           products => this.parsProducts(products),
           error =>  this.errorParser(error));	
    }
  }

  errorParser(error) {
    this.errorMessage = <any>error;

    if (this.infiniteScroll) {
       this.infiniteScroll.target.complete();
       this.infiniteScroll.target.disabled = true;
    }
  }

  async addProduct() {
   let alertMsg = this.sheetLabels["Market_Ask_New_Product"] + this.memberFullname + "?";

   if (this.groupID > 0) {
      let buttons = [
        {
          text: this.sheetLabels["All_Personal"],
          handler: () => {
            this.goAddProduct(0);
          }
        }, {
          text: this.sheetLabels["All_Group"],
          handler: () => {
            this.goAddProduct(this.groupID);
          }
        }, {
          text: this.sheetLabels["All_BTN_Cancel"],
          role: 'cancel',
          handler: (blah) => {
            console.log('Cancel clicked');
          }
        }
      ];

    this.popTools.showAlertList(this.sheetLabels["Product_New"], alertMsg, null, buttons);
  } else {
    this.goAddProduct(0);
   }
  }

  async goAddProduct(thisGroup) {
    let postString = "";

    this.productEdit.Title = "";
    this.productEdit.Category = 1;
    this.productEdit.SubCategory = 1;
    this.productEdit.MinPrice = 0;
    this.productEdit.Description = "";
    this.productEdit.Brand = "";
    this.productEdit.Country = "US";
    this.productEdit.Currency = "USD";
    this.productEdit.PhotoLocation = "../../assets/imgs/G_earth.png";
    this.formOptions.Title = this.sheetLabels["Product_New"];
    let params = { "product": this.productEdit, "options": this.formOptions };

    this.popRoutes.showModal("ProductEditPage", params, (data) => {
      if (data) {
        delete data["PhotoLocation"];

        for (var key in data) {
          if (postString != "") {postString = postString + "&";}
          postString = postString + key + "=" + data[key];
        }
        if (postString != "") {
          this.popTools.showLoading();
          this.rest.newProduct(thisGroup,postString)
            .subscribe(
              response => this.parsResponse(thisGroup,response),
              error =>  this.errorNotification(error));
        }  
      }
    });
  }

  parsResponse(thisGroup, response) {
    let params = { productID: 0, groupID: thisGroup };

    this.popTools.dismissLoading();
    if (response.rowsAffected[0] && response.ID) {
      params.productID = response.ID 
      this.popTools.showToast(this.sheetLabels["Add_Message"], null);
      this.popRoutes.navigateForward('/product', params);
    } else if (response.rowsAffected[0]) {
      this.products = [];
      this.getProducts();
      this.popTools.showToast(this.sheetLabels["Add_Message"], null);
    } else {
      this.popTools.showAlert(this.sheetLabels["Al_SystemError"],JSON.stringify(response));
    }
  }

  showGroup(lngGroupID) {
   let params = { groupID: lngGroupID };

   this.popRoutes.navigateForward('/group-details', params);
  }

  showMember(lngMemberID) {
   let params = { memberID: lngMemberID, isFriend: null };

   this.popRoutes.navigateForward('/member-profile', params);
  }

  showObject(lngIndex) {
    var ObjectData = this.products[lngIndex];
    var params = {"ObjectType": "product", "ObjectID": ObjectData["ID"], Location: ObjectData["PhotoLocation"], 
		    Description: ObjectData["Title"], "Likes": ObjectData["Likes"], "NLikes": ObjectData["NLikes"], 
		    "Comments": ObjectData["Comments"], NoIcons: null, ShowComments: true, "resourceType": 1};

    let pageClosed = (retData)=>{
      if (retData.Likes != null && retData.Likes > 0) {this.increaseCount(lngIndex, "Likes", 1);}
      if (retData.NLikes != null && retData.NLikes > 0) {this.increaseCount(lngIndex, "NLikes", 1);}
      if (retData.Comments != null && retData.Comments > 0) {this.increaseCount(lngIndex, "Comments", retData.Comments);}
    }
    params["pageClosed"] = pageClosed;
    this.popRoutes.navigateForward('/show-photo', params);
  }

  increaseCount(lngIndex, strObject, lngValue) {
    var lngCount = 0;

    switch(strObject) {
      case "Likes":
	      lngCount = Number(this.products[lngIndex].Likes) + lngValue;
	      this.products[lngIndex].Likes = lngCount
	      break;
      case "NLikes":
	      lngCount = Number(this.products[lngIndex].NLikes) + lngValue;
	      this.products[lngIndex].NLikes = lngCount
	      break;
      case "Comments":
	      lngCount = Number(this.products[lngIndex].Comments) + lngValue;
	      this.products[lngIndex].Comments = lngCount
	      break;
    }
  }

  async showAddLikePrompt(lngIndex) {
    this.popTools.showAddLikePrompt(this.sheetLabels["Market_ProductLike"], (data) => {
      if (data == 3) {
        var strTitle = this.sheetLabels["All_Product"] + " " + this.products[lngIndex].Title;
        var params = { ObjectType:"product", ObjectID: this.products[lngIndex].ID, Title: strTitle };
        this.popTools.showLikes(params, (data2) => {
          if (data2 > 0) {this.showMember(data2);}
        });
      } else if (data > 0) {
        this.sendLike(lngIndex,data)
      }
    });
  }
  
  sendLike(lngIndex,like) {
    this.popTools.showLoading();
    this.rest.postLike("product", this.products[lngIndex].ID, like)
      .subscribe(
        response => this.parsLikeResponse(response, lngIndex, like),
        error =>  this.popTools.parsPostError(error));
  }

  parsLikeResponse(response,lngIndex,like) {
    var lngCount = 0;

    if (response.rowsAffected[0]) {
      if (like == 1) {
	      lngCount = Number(this.products[lngIndex].Likes) + 1;
	      this.products[lngIndex].Likes = lngCount;
      } else {
	      lngCount = Number(this.products[lngIndex].NLikes) + 1;
	      this.products[lngIndex].NLikes = lngCount;
      }

      this.popTools.dismissLoading();
      this.popTools.showToast(this.sheetLabels["Social_LikeSet"],this.products[lngIndex].PhotoLocation);
    } else {
      this.errorNotification(response);
    }
  }

  errorNotification(error) {
    this.errorMessage = <any>error;

    this.popTools.dismissLoading();
    let jsonError = JSON.parse(error)
    if (jsonError.code) {
      if (jsonError.code != "ITEM_NOT_FOUND") {this.popTools.showAlert(this.sheetLabels["Al_SystemError"],error);}
    } else {
      this.popTools.showAlert(this.sheetLabels["Al_SystemError"],error);
    }
  }

  emptyMethod() {
  }

  getItems(ev: any) {

  }

}
