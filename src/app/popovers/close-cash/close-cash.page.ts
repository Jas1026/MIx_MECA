import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-close-cash',
  templateUrl: './close-cash.page.html',
  styleUrls: ['./close-cash.page.scss'],
})
export class CloseCashPage implements OnInit {
  user_name = "";
  efectivo = 0.00;
  tarjeta = 0.00;
  qr = 0.00;
  debe = 0.00;
  cash_data: any = [];
  constructor(private serverContent: ServerContentService, 
    private router: Router,
    private popoverController: PopoverController) { }

  ngOnInit() {
    this.user_name = sessionStorage.getItem("nombre") || "";
    this.serverContent.CheckCash().subscribe(async data => {
      this.cash_data = data;
    });
  }
  CloseCash() {
    this.serverContent.CloseCash().subscribe(async data => {
      localStorage.setItem("nombre", "");
      localStorage.setItem("tipo", "");
      this.popoverController.dismiss();
      this.router.navigate(['home']);
    });
  }

}
