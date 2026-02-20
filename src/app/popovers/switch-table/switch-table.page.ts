import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-switch-table',
  templateUrl: './switch-table.page.html',
  styleUrls: ['./switch-table.page.scss'],
})
export class SwitchTablePage implements OnInit {
  @Input() table: any;

  zones: any = [];
  alltables: any = [];
  tables: any = [];
  tableSelected = 0;
  constructor(private serverContent: ServerContentService, 
    private router: Router,
    private popoverController: PopoverController) { }

  ngOnInit() {
    this.serverContent.LoadZones().subscribe(async data => {
      this.zones = data;
    });
  }
  ZoneSelected(event:any) {
    console.log(event.detail.value);
    this.serverContent.LoadTables(event.detail.value).subscribe(async data => {
      this.alltables = data;
      this.alltables.forEach((table: { state: string }) => {
        if (table.state == "vacia") {
          this.tables.push(table);
        }
      });
    });
  }
  TableSelected(event:any) { 
    this.tableSelected = event.detail.value;
  }

  SwitchTable(){
    if (this.tableSelected == 0) {
      return;
    }
    this.serverContent.SwitchTable(this.table[0].id, this.tableSelected.toString()).subscribe(async data => {
      console.log(data);
      this.popoverController.dismiss();
      this.router.navigate(['tables']);
    });
  }
}
