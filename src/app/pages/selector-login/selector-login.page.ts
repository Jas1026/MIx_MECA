import { Component } from '@angular/core';

@Component({
  selector: 'app-selector-login',
  templateUrl: './selector-login.page.html',
  styleUrls: ['./selector-login.page.scss'],
})
export class SelectorLoginPage {

  isMeca: boolean = false;

  email: string = '';
  password: string = '';

  login() {

    if (this.isMeca) {
      console.log("Login MECA");
      // aquí llamas a endpoint MECA
    } else {
      console.log("Login MIXTURA");
      // aquí llamas a endpoint MIXTURA
    }

  }

}