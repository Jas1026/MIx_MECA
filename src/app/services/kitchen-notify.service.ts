import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KitchenNotifyService {

  private notifySource = new Subject<any>();
  notify$ = this.notifySource.asObservable();

  private channel = new BroadcastChannel('kitchen_notifications');

  constructor(){

    // escuchar eventos de otras pestañas
    this.channel.onmessage = (event) => {
      this.notifySource.next(event.data);
    };

  }

  pushNotification(data:any){

    // enviar a esta pestaña
    this.notifySource.next(data);

    // enviar a otras pestañas
    this.channel.postMessage(data);

  }

}