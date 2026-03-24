import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons'; // Importación extra para asegurar el icono
import { logOutOutline } from 'ionicons/icons';

@Component({
  selector: 'app-logout-button',
  standalone: true,
  imports: [IonicModule, CommonModule],
  template: `
    <ion-buttons slot="end">
      <ion-button (click)="confirmLogout()" color="danger">
        <ion-icon slot="icon-only" name="log-out-outline"></ion-icon>
      </ion-button>
    </ion-buttons>
  `,
  styles: [`
    ion-button {
      --padding-start: 8px;
      --padding-end: 8px;
    }
  `]
})
export class LogoutButtonComponent {
  constructor(private router: Router, private alertController: AlertController) {
    // Registramos el icono manualmente para que no falle
    addIcons({ 'log-out-outline': logOutOutline });
  }

  async confirmLogout() {
    const alert = await this.alertController.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro de que deseas salir?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Salir', handler: () => this.router.navigate(['/login']) }
      ]
    });
    await alert.present();
  }
}