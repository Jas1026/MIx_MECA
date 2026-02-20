import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
  selector: 'app-add-brief-note',
  templateUrl: './add-brief-note.page.html',
  styleUrls: ['./add-brief-note.page.scss'],
})
export class AddBriefNotePage implements OnInit {
  notes = "";
  constructor(private popoverController: PopoverController, private serverContent: ServerContentService) { }

  ngOnInit() {
  }
  Close() {
    this.popoverController.dismiss();
  }  
  AddBrief() {
    this.serverContent.AddBrief(this.notes).subscribe(async data => {
      this.serverContent.LoadBrief().subscribe(async data => {
        this.Close();
      });
    });
  }

}
