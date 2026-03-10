import { Component, OnInit } from '@angular/core';
import { KitchenNotifyService } from '../../services/kitchen-notify.service';

@Component({
  selector: 'app-kitchen-ready-toast',
  templateUrl: './kitchen-ready-toast.component.html',
  styleUrls: ['./kitchen-ready-toast.component.scss']
})
export class KitchenReadyToastComponent implements OnInit {

  visible = false;
  data:any = null;

  private audio = new Audio('assets/sounds/notificacion.mp3');

  constructor(private notify:KitchenNotifyService){}

  ngOnInit(){

    this.notify.notify$.subscribe((data)=>{
  console.log("🔥 NOTIFICACION RECIBIDA", data);
      this.data = data;
      this.visible = true;

      this.audio.play().catch(()=>{});

      setTimeout(()=>{
        this.visible = false;
      },3000);

    });

  }

}