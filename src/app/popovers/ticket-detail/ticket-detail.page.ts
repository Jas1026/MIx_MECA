import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.page.html',
  styleUrls: ['./ticket-detail.page.scss'],
})
export class TicketDetailPage implements OnInit {
  @Input() pid: any;
  @Input() notes: string = "";
  constructor(private popoverController: PopoverController, private serverContent: ServerContentService) { }

  ngOnInit() {
  }
  Close() {
    this.popoverController.dismiss();
  }
  AddNote() {
    this.serverContent.UpdateTableNotes(this.pid.toString(), this.notes).subscribe(async data => { 
      console.log("error: ", data);
    });
    this.popoverController.dismiss();
  }
}
