import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { CloseCashPage } from 'src/app/popovers/close-cash/close-cash.page';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.page.html',
  styleUrls: ['./tables.page.scss'],
})
export class TablesPage {

  zoneId = 0;
  zoneName = "";
  tables: any = [];
  etables: any = [];
  otables: any = [];
  canUpdate = true;
  constructor(private router: Router,
    private serverContent: ServerContentService,
    private route: ActivatedRoute,
    private popoverController: PopoverController) { }

  ionViewWillEnter() {
    this.canUpdate = true;
    this.route.params.subscribe(params => {
      if (params['item'] == null) {
        this.zoneId = parseInt(localStorage.getItem("zone") || "0");
        switch (this.zoneId) {
          case 1:
            this.zoneName = "Piso 1 - Café";
            break;
          case 2:
            this.zoneName = "Piso 2 - Lounge";
            break;
          case 3:
            this.zoneName = "Piso 3 - Terraza";
            break;
          case 7:
            this.zoneName = "Meca - Piso 1";
            break;
          case 8:
            this.zoneName = "Meca - Piso 2";
            break;
          case 9:
            this.zoneName = "Meca - Piso 3";
            break;
          case 10:
            this.zoneName = "Meca - Barra";
            break;
          default:
            this.zoneName = "Mesas";
            break;
        }

      } else {
        this.zoneId = params['item'];
        //localStorage.setItem("zone", this.zoneId.toString());
      }
    });
    this.UpdateContent();
  }
  ionViewWillLeave() {
    this.canUpdate = false;
  }
  OpenTable(table: number, isClosed: number) {
    let role = localStorage.getItem("user_role");
    if (isClosed == 1 && role != 'admin' && role != 'mesero') return;
    this.router.navigate(['table', { item: table }]);
  }

  UpdateContent() {
    if (!this.canUpdate) return;
    this.serverContent.LoadTables(this.zoneId.toString()).subscribe(async data => {
      this.tables = data;
    });
    setTimeout(() => {
      this.UpdateContent();
    }, 5000);
  }
  LogOut() {
    localStorage.setItem("nombre", "");
    localStorage.setItem("tipo", "");
    this.router.navigate(['home']);
  }
  async CloseCash() {
    let popover = await this.popoverController.create({
      component: CloseCashPage,
      translucent: true,
    });
    await popover.present();
  }
  GoNext(page: string) {
    this.router.navigate([page]);
  }
}
