import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-kitchen',
  templateUrl: './kitchen.page.html',
  styleUrls: ['./kitchen.page.scss'],
})
export class KitchenPage {
  kitchenId = 0;
  kitchenName = "";
  pedidos: any = [];
  npedidos: any = [];
  canUpdate = true;
  constructor(private serverContent: ServerContentService, 
    private route: ActivatedRoute,
    private router: Router) { }

  ionViewWillEnter() { 
    this.canUpdate = true;
    this.route.params.subscribe(params => {
      this.kitchenId = params['item'];
      if (this.kitchenId == 1) {
        this.kitchenName = "Café";
      } else if (this.kitchenId == 2) {
        this.kitchenName = "Barra cocteles";
      } else if (this.kitchenId == 3) {
        this.kitchenName = "Cocina";
      } else {
        this.kitchenName = "Pizzas";
      }
    });
    this.UpdateContent();
  }
  ionViewWillLeave() {
    this.canUpdate = false;
  }
  UpdateContent() {
    this.serverContent.LoadKitchen(this.kitchenId.toString()).subscribe(async data => {
      this.pedidos = data;
      this.npedidos = [];
      this.pedidos.forEach((pedido: { pstate: string, epstate: string }) => { 
        if (pedido.pstate == "si") { 
          this.npedidos.push(pedido);
        }
      });
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

}
