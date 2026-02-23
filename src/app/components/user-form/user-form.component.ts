import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServerContentService } from 'src/app/services/server-content.service';


@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent implements OnInit {

  @Input() user: any;
  form!: FormGroup;
  isEdit = false;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private server: ServerContentService
  ) { }

ngOnInit() {

  this.isEdit = !!this.user;

  this.form = this.fb.group({
    id: [this.user?.id || null],  // 👈 ESTA LÍNEA ES LA CLAVE
    name: [this.user?.name || '', Validators.required],
    code: [this.user?.code || '', Validators.required],
    role_id: [this.user?.role_id || '', Validators.required],
    password: ['', this.isEdit ? [] : Validators.required],
    state: [this.user?.state || 'activo']
  });

}

  dismiss() {
    this.modalCtrl.dismiss();
  }

save() {

  if (this.form.invalid) {
    console.log("❌ FORM INVALIDO");
    console.log("Errores:", this.form.errors);
    console.log("Valores:", this.form.value);
    return;
  }

  const data = this.form.value;

  console.log("🚀 Enviando datos al backend:");
  console.log(JSON.stringify(data, null, 2));

  if (this.isEdit) {

    console.log("🟡 MODO EDICIÓN");

    this.server.updateUser(data).subscribe({
      next: (res: any) => {
        console.log("✅ RESPUESTA DEL BACKEND:", res);

        if (res.success) {
          this.modalCtrl.dismiss(true);
        }
      },
      error: (err) => {
        console.error("🔥 ERROR COMPLETO:", err);
      }
    });

  } else {

    console.log("🟢 MODO CREACIÓN");

    this.server.createUser(data).subscribe({
      next: (res: any) => {
        console.log("✅ RESPUESTA DEL BACKEND:", res);

        if (res.error === 0 || res.success) {
          this.modalCtrl.dismiss(true);
        }
      },
      error: (err) => {
        console.error("🔥 ERROR COMPLETO:", err);
      }
    });

  }
}
}