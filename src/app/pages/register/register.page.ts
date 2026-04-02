import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../services/estacionamiento';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterLink
  ]
})
export class RegisterPage {

  nombre: string = '';
  correo: string = '';
  password: string = '';

  constructor(
    private api: ApiService,
    private router: Router,
    private alertController: AlertController
  ) {}

  async registrar(){

    // Validar campos vacíos
    if(!this.nombre || !this.correo || !this.password){

      const alert = await this.alertController.create({
        header:'Error',
        message:'Completa todos los campos',
        buttons:['OK']
      });

      await alert.present();
      return;
    }

    const datos = {
      nombre: this.nombre,
      correo: this.correo,
      password: this.password
    }

    this.api.registrar(datos).subscribe(async (resp:any)=>{

      if(resp.success){

        const alert = await this.alertController.create({
          header:'Registro exitoso',
          message:'Tu cuenta fue creada',
          buttons:['OK']
        });

        await alert.present();
        await alert.onDidDismiss();

        // Redirigir al login
        this.router.navigate(['/login']);

      } else {

        const alert = await this.alertController.create({
          header:'Error',
          message: resp.mensaje, 
          buttons:['OK']
        });

        await alert.present();

      }

    }, async () => {

      const alert = await this.alertController.create({
        header:'Error',
        message:'El correo ya existe',
        buttons:['OK']
      });

      await alert.present();

    });

  }

}