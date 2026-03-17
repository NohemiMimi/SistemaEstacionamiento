import { Component } from '@angular/core';
import { NavController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pago',
  templateUrl: './pago.page.html',
  styleUrls: ['./pago.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class PagoPage {
  // Inyectamos NavController para navegar
  constructor(private navCtrl: NavController) {}

  irAPagoFinal() {
    console.log("Navegando a pago-final...");
    this.navCtrl.navigateForward('/pago-final');
  }
}