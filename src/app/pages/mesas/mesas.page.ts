import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServerContentService } from '../../services/server-content.service';

@Component({
  selector: 'app-mesas',
  templateUrl: './mesas.page.html',
  styleUrls: ['./mesas.page.scss'],
})
export class MesasPage implements OnInit {

  tables: any[] = [];
  flatId: string = '';

  constructor(
    private route: ActivatedRoute,
    private server: ServerContentService
  ) {}

ngOnInit() {

  this.route.paramMap.subscribe(params => {

    this.flatId = params.get('id') || '';
    console.log("Flat recibido:", this.flatId);

    this.loadTables();

  });

}
loadTables() {

  const system = localStorage.getItem("system") || '';

  this.server.getTables(system, this.flatId)
    .subscribe((res: any) => {

      console.log("Respuesta mesas:", res);

      if (res.error === 0) {
        this.tables = res.data;
      }

    });

}
}