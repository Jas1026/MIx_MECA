import { Component } from '@angular/core';

@Component({
  selector: 'app-selector-login',
  templateUrl: './selector-login.page.html',
  styleUrls: ['./selector-login.page.scss'],
})
export class SelectorLoginPage {

  isMeca = false;
  email = '';
  password = '';

  login() {
    if (this.isMeca) {
      console.log('Login MECA');
    } else {
      console.log('Login MIXTURA');
    }
  }
}