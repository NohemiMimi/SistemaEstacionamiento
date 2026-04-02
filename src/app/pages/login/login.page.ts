import { Component } from '@angular/core';
import { AlertController, IonButton, IonContent, IonInput, IonItem } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/estacionamiento';
import { addIcons } from 'ionicons'; 
import { personCircleOutline, lockClosedOutline, notificationsOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonItem, RouterLink, FormsModule, IonButton, IonInput]
})
export class LoginPage {

  correo: string = '';
  password: string = '';

  constructor(
    private api: ApiService,
    private alertController: AlertController
  ) {
    addIcons({ personCircleOutline, lockClosedOutline, notificationsOutline });
  }

  async login() {
    if (!this.correo || !this.password) {
      this.mostrarAlerta('Error', 'Completa todos los campos');
      return;
    }

    const datos = {
      correo: this.correo,
      password: this.password
    };

    this.api.login(datos).subscribe({
      next: async (resp: any) => {
        if (resp.success) {
          localStorage.setItem("usuario", JSON.stringify(resp.usuario));

          const rol = (resp.usuario.rol || '').trim().toLowerCase();
          console.log('Rol detectado:', rol);

          const alert = await this.alertController.create({
            header: 'Bienvenido',
            message: 'Inicio de sesión exitoso',
            buttons: [{
              text: 'OK',
              handler: () => {
           
                const destino = rol === 'admin' ? '/admin' : '/home';
                console.log('Navegando a:', destino);
                window.location.href = destino;
              }
            }]
          });

          await alert.present();

        } else {
          this.mostrarAlerta('Error', resp.mensaje || 'Credenciales incorrectas');
        }
      },
      error: async () => {
        this.mostrarAlerta('Error', 'Credenciales incorrectas');
      }
    });
  }

  async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}