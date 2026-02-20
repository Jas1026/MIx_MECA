import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddBriefNotePage } from './add-brief-note.page';

const routes: Routes = [
  {
    path: '',
    component: AddBriefNotePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddBriefNotePageRoutingModule {}
