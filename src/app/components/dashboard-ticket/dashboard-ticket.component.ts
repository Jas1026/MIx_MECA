import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard-ticket',
  templateUrl: './dashboard-ticket.component.html',
  styleUrls: ['./dashboard-ticket.component.scss'],
})
export class DashboardTicketComponent  implements OnInit {
  @Input() table:any;

  aviable = false;
  tableStatus = "";
  user = "";
  tableStyle = "ticket-state state-ready";
  dotStyle = "ticket-dot dot-empty";
  ticketStyle = "ticket ticket-empty";
  hasProductsReady = false;
  constructor() { }

  ngOnInit() {
    if (this.table.entregado == 'NULL') {
      this.table.entregado = 0;
    }
    if(this.table.entregado < this.table.espera && this.table.listo > 0) {
      this.hasProductsReady = true;
    }
    if (this.table.state == "vacia") {
      this.tableStatus = "Vacía";
      this.aviable = true;
    } else if (this.table.state == "ocupada") {
      this.tableStatus = "Espera";
      this.tableStyle = "ticket-state state-waiting";
      this.dotStyle = "ticket-dot dot-empty";
    } else if (this.table.state == "con pedido") {
      this.tableStatus = "Espera";
      this.tableStyle = "ticket-state state-waiting";
      this.dotStyle = "ticket-dot dot-waiting";
    } else if (this.table.state == "entregado") {
      this.tableStatus = "entregado";
      this.tableStyle = "ticket-state state-ready";
      this.dotStyle = "ticket-dot dot-done";
    }
    this.TicketTimer();
  }
  TicketTimer() {
    if (this.table.timer == null || this.table.state == "entregado") return;
    let time = new Date(this.table.timer);
    let now = new Date();
    let diff = now.getTime() - time.getTime();
    let minutes = Math.floor(diff / 60000);
    if (minutes > 25) { 
      this.ticketStyle = "ticket ticket-danger";
    } else if (minutes > 20) {
      this.ticketStyle = "ticket ticket-warning";
    } else {      
      this.ticketStyle = "ticket ticket-empty";
    }
    let seconds = Math.floor((diff - minutes * 60000) / 1000);
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  }

}
