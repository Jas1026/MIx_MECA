import { Component, Input, OnInit, Output } from '@angular/core';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-kitchen-table-item',
  templateUrl: './kitchen-table-item.component.html',
  styleUrls: ['./kitchen-table-item.component.scss'],
})
export class KitchenTableItemComponent  implements OnInit {
  @Input() item:any;
  constructor(private serverContent: ServerContentService) { }
  itemStyle = "item-detail item-normal";
  ngOnInit() {
    this.ItemTimer();
  }
  ProductCooked(pid:number) {
    if (this.item.extra == 1) { 
       return; 
    }
    this.serverContent.UpdateProductStatus(pid.toString(), "listo").subscribe(async data => {
      this.item.state = "listo";
    });
  }
  ItemTimer() {
    let time = new Date(this.item.sent_at);
    let now = new Date();
    let diff = now.getTime() - time.getTime();
    let minutes = Math.floor(diff / 60000);
    if (minutes > 25) { 
      this.itemStyle = "item-detail item-danger";
    } else if (minutes > 20) {
      this.itemStyle = "item-detail item-warning";
    } else {      
      this.itemStyle = "item-detail item-normal";
    }
    let seconds = Math.floor((diff - minutes * 60000) / 1000);
    if (seconds < 6 && minutes < 1 && this.item.state == "espera") {
      this.PlaySound();
    }
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  }
  PlaySound() {
    let audio = new Audio();
    audio.src = "assets/sounds/bell2.wav";
    audio.load();
    audio.play();
  }
}
