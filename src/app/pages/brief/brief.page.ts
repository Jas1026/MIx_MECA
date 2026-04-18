import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, PopoverController } from '@ionic/angular';
import { AddBriefNotePage } from 'src/app/popover/add-brief-note/add-brief-note.page';
import { AddBriefProductPage } from 'src/app/popover/add-brief-product/add-brief-product.page';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-brief',
  templateUrl: './brief.page.html',
  styleUrls: ['./brief.page.scss'],
})
export class BriefPage {
  name = "";
  briefs: any = [];
  next = "";
  floor = 0;
  role = "";
  canUpdate = true;
  constructor(private serverContent: ServerContentService, 
    private popoverController: PopoverController,
    private alertController: AlertController,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {    
    this.route.params.subscribe(params => {
      this.next = params['next'];
      this.floor = params['item'];
    });
    this.role = sessionStorage.getItem("user_role") || "";
    this.name = sessionStorage.getItem("user_name") || "";
    this.LoadBrief();
  }
  ionViewWillEnter(){
    this.route.params.subscribe(params => {
      this.next = params['next'];
      this.floor = params['item'];
    });
    this.role = sessionStorage.getItem("user_role") || "";
    this.name = sessionStorage.getItem("user_name") || "";
    this.LoadBrief();
    
  }
  ionViewWillLeave(){
    this.canUpdate = false;
  }
  LoadBrief() {
    if (!this.canUpdate) {
      return;
    }
    this.serverContent.LoadBrief().subscribe(async data => {
      this.briefs = data;
    });
    setTimeout(() => {
      this.LoadBrief();      
    }, 5000);
  }
  async DeleteBrief(id: string, esPunto: string) {
      let msg = (esPunto == "si") ? "punto" : "producto";
     const alert = this.alertController.create({
      header: 'ELIMINAR',
      message: '¿Desea eliminar este '+msg+'?',
      cssClass: 'meca-alert',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'btn-white'
        }, {
          text: 'Eliminar',
          cssClass: 'btn-red',
          handler: () => {
            if(esPunto == "si") {
              this.serverContent.DeleteBrief(id).subscribe(async data => {
                this.serverContent.LoadBrief().subscribe(async data => {
                  this.briefs = data;
                });
              });
            } else {
              this.serverContent.DeleteBriefProduct(id).subscribe(async data => {
                this.serverContent.LoadBrief().subscribe(async data => {
                  this.briefs = data;
                });
              });

            }
            this.LoadBrief();
          }
        }]
    });
    (await alert).present();    
  }
  
  async AddBriefNote() {
    const popover = await this.popoverController.create({
      component: AddBriefNotePage,
      translucent: true,
    });
    await popover.present();
    popover.onDidDismiss().then(() => {
      this.LoadBrief();
    });
  }
  async AddBriefProduct() {
    const popover = await this.popoverController.create({
      component: AddBriefProductPage,
      translucent: true,
    });
    await popover.present();
    popover.onDidDismiss().then(() => {
      this.LoadBrief();
    });
  }
  GoNext() {    
    this.router.navigate([this.next, { item: this.floor }]);
  }
}
