import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss'],
})
export class TicketComponent  implements OnInit {
  @Input() table:any;

  aviable = false;
  tableStatus = "";
  user = "";
  assignedStyle = "ticket-user";
  tableStyle = "ticket-state state-ready";
  dotStyle = "ticket-dot dot-empty";
  ticketStyle = "ticket ticket-empty";
  constructor() { }

  ngOnInit() {
    this.user = this.table.user_name;
    if (this.user == localStorage.getItem("user_name")) {
      this.user = "Tú";
    } else if (this.table.id_user == 0) {
      this.assignedStyle = "ticket-nouser";
      this.user ="Sin asignar";
    } else if (this.table.id_user == -1) {
      this.assignedStyle = "ticket-reduser";
      this.user ="SIN ASIGNAR";
    }
    if (this.table.closed == 1) {
      this.user = "Clausurada";
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
      this.tableStatus = "-";
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
