import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-table-record',
  templateUrl: './table-record.page.html',
  styleUrls: ['./table-record.page.scss'],
})
export class TableRecordPage {

  tableid = 0;
  table: any = [];
  records: any = [];
  constructor(private router: Router, 
    private route: ActivatedRoute, 
    private serverContent: ServerContentService) { }

    ionViewWillEnter(){
      this.route.params.subscribe(params => {
        this.tableid = params['item']; 
      });    
      this.serverContent.LoadTableRecord(this.tableid.toString()).subscribe(async data => {
        this.records = data;
      });
    }
  
  GoNext(page: string) {    
    this.router.navigate([page]);
  }

}
