import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home',

templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})

export class HomePage {
constructor(private navCtrl: NavController) {}

  irAEntrada() {
    this.navCtrl.navigateForward('/pago');
  }
}