import { Component } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/estacionamiento';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    RouterLink,
    FormsModule
  ]
})
export class LoginPage {

  correo: string = '';
  password: string = '';

  constructor(
    private api: ApiService,
    private router: Router,
    private alertController: AlertController
  ) {}

  async login(){

    // validar campos vacíos
    if(!this.correo || !this.password){

      const alert = await this.alertController.create({
        header:'Error',
        message:'Completa todos los campos',
        buttons:['OK']
      });

      await alert.present();
      return;
    }

    const datos = {
      correo: this.correo,
      password: this.password
    }

    this.api.login(datos).subscribe(async (resp:any)=>{

      if(resp.success){

        // guardar usuario en localStorage
        localStorage.setItem("usuario", JSON.stringify(resp.usuario));

        const alert = await this.alertController.create({
          header:'Bienvenido',
          message:'Inicio de sesión exitoso',
          buttons:['OK']
        });

        await alert.present();
        await alert.onDidDismiss();

        const rol = resp.usuario.rol;

        // 🔥 redirección según rol
        if (rol === 'admin') {
          this.router.navigate(['/admin'], { replaceUrl: true });
        } else {
          this.router.navigate(['/home'], { replaceUrl: true });
        }

      }else{

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
        message:'No se pudo conectar con el servidor',
        buttons:['OK']
      });

      await alert.present();

    });

  }

}