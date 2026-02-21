import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ServerContentService } from '../services/server-content.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(private router: Router, private serverContent: ServerContentService, private alertController: AlertController) { }
  nombre = "";
  tipo = "";
  error = "";
  role = "";
  showError = false;
  cash_data: any = [];
  cash_data2: any = [];
  zones: any = [];
  ionViewWillEnter() {
    this.serverContent.LoadZones().subscribe(async data => {
      this.zones = data;
    });
  }
  
  async Login() {
    if (this.nombre == "" || this.tipo == "") {
      this.showError = true;
      this.error = "Debe llenar los campos.";
      return;
    }
    this.serverContent.Login(this.nombre, this.tipo).subscribe(async data => {
      this.cash_data = data;
      if (this.cash_data["error"] == "1") {
        this.showError = true;
        this.error = this.cash_data["message"];
        return;
      } else {
        if (this.cash_data["roles"] == 1 && parseInt(this.tipo) < 7) {
          const alert = this.alertController.create({
            header: 'ELEGIR ROL',
            message: 'Seleccione el rol con el que desea ingresar.',
            cssClass: 'meca-alert',
            buttons: [
              {
                text: 'Cocina',
                handler: () => {
                  localStorage.setItem("user_id", this.cash_data["id"]);
                  this.role = "cocina";
                  localStorage.setItem("user_role", this.role);
                  localStorage.setItem("floor", this.tipo);
                  localStorage.setItem("user_name", this.cash_data["name"]);
                  this.Kitchen(parseInt(this.tipo));
                }
              },
              {
                text: 'Mesero',
                handler: () => {
                  localStorage.setItem("user_id", this.cash_data["id"]);
                  this.role = "mesero";
                  localStorage.setItem("user_role", this.role);
                  localStorage.setItem("floor", this.tipo);
                  localStorage.setItem("user_name", this.cash_data["name"]);
                  this.serverContent.OpenCash(this.tipo).subscribe(data => {
                    this.cash_data2 = data;
                    localStorage.setItem("cash_id", this.cash_data2["cash_id"]);
                  });
                  this.LoginM(parseInt(this.tipo));
                }
              }
            ]
          });
          (await alert).present();
        } else {
          localStorage.setItem("floor", this.tipo);
          localStorage.setItem("user_id", this.cash_data["id"]);
          this.role = this.cash_data["role"];
          localStorage.setItem("user_role", this.role);
          localStorage.setItem("user_name", this.cash_data["name"]);

          if (this.role == "cocina") {
            this.Kitchen(parseInt(this.tipo));
          } else {
            this.serverContent.OpenCash(this.tipo).subscribe(data => {
              this.cash_data2 = data;
              localStorage.setItem("cash_id", this.cash_data2["cash_id"]);
            });
            if (parseInt(this.tipo) >= 7) {
              this.LoginMeca(parseInt(this.tipo));
            } else {
              this.LoginM(parseInt(this.tipo));
            }
          }
        }



      }

    });
  }
  LoginM(id: number) {
    this.router.navigate(['brief', { next: 'dashboard', item: id }]);
  }
  LoginMeca(id: number) {
    this.router.navigate(['dashboard', { item: id }])
  }
  Kitchen(id: number) {
    this.router.navigate(['brief', { next: 'kitchen', item: id }]);
  }
  TypeSelected(event: any) {
    this.tipo = event.target.value;
    console.log(this.tipo);
  }
}
