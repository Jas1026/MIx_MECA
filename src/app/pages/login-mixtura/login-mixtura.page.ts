import { Component, OnInit } from '@angular/core';
import { ServerContentService } from '../../services/server-content.service';
@Component({
  selector: 'app-login-mixtura',
  templateUrl: './login-mixtura.page.html',
  styleUrls: ['./login-mixtura.page.scss'],
})
export class LoginMixturaPage implements OnInit {
  users: any[] = [];

  constructor(private server: ServerContentService) {}

  ngOnInit() {
   
  }


}
