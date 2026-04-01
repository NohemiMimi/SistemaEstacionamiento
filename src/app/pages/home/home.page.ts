import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonContent,
  IonButton
} from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { ApiService, DashboardStats } from '../services/estacionamiento';
import { LogoutButtonComponent } from '../logout-button/logout-button.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LogoutButtonComponent,

    IonHeader,
    IonToolbar,
    IonButtons,
    IonContent,
    IonButton
  ]
})
export class HomePage implements OnInit {

  stats: DashboardStats = {
    totalSpaces: 0,
    occupiedSpaces: 0,
    availableSpaces: 0,
    dailyIncome: 0
  };

  constructor(
    private navCtrl: NavController,
    private parkingService: ApiService
  ) {}

  ngOnInit() {
    this.loadSpaces();

    setInterval(() => {
      this.loadSpaces();
    }, 3000);
  }

  loadSpaces() {
    this.parkingService.getStats().subscribe((data: any) => {
      this.stats.availableSpaces = data.availableSpaces;
    });
  }

  irAEntrada() {
    this.navCtrl.navigateForward('/pago');
  }
}