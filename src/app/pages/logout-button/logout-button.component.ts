import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonButton,
  IonIcon,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';

@Component({
  selector: 'app-logout-button',
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon],
  styles: [`
  .logout-btn {
    --color: white; /* 🔥 icono blanco */
  }
`],
  template: `
    <ion-button (click)="confirmLogout()" class="logout-btn">
      <ion-icon slot="icon-only" name="log-out-outline"></ion-icon>
    </ion-button>
  `
})
export class LogoutButtonComponent {

  constructor(
    private router: Router,
    private alertController: AlertController
  ) {
    addIcons({ 'log-out-outline': logOutOutline });
  }

  async confirmLogout() {
    const alert = await this.alertController.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro de que deseas salir?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salir',
          handler: () => this.router.navigate(['/login'])
        }
      ]
    });

    await alert.present();
  }
}