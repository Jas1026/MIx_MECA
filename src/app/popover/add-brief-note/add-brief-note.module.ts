import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddBriefNotePageRoutingModule } from './add-brief-note-routing.module';

import { AddBriefNotePage } from './add-brief-note.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddBriefNotePageRoutingModule
  ],
  declarations: [AddBriefNotePage]
})
export class AddBriefNotePageModule {}
