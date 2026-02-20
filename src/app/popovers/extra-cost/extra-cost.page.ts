import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-extra-cost',
  templateUrl: './extra-cost.page.html',
  styleUrls: ['./extra-cost.page.scss'],
})
export class ExtraCostPage implements OnInit {
  @Input() table: any;
  cost = 0;
  notes = "";
  constructor(private popoverController: PopoverController, private serverContent: ServerContentService) { }

  ngOnInit() {
  }
  
  Close() {
    this.popoverController.dismiss();
  }
  Cost(ev:any) {
    this.cost = ev.detail.value;
  }
  AddCost() {
    if (this.cost == 0 || this.notes == "") {
      return;
    }
    this.serverContent.AddExtraCost(
      this.table.toString(), 
      this.cost.toString(),
      this.notes
    ).subscribe(async data => {
      console.log("error: ", data);
    });
    this.popoverController.dismiss();
  }
}
