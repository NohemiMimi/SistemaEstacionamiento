import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { ApiService, DashboardStats, Vehicle, Alert } from '../services/estacionamiento';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HttpClientModule]
})
export class AdminPage implements OnInit {

  stats: DashboardStats = {
    totalSpaces: 0,
    occupiedSpaces: 0,
    availableSpaces: 0,
    dailyIncome: 0
  };

  vehicles: Vehicle[] = [];
  visibleVehicles: Vehicle[] = [];
  alerts: Alert[] = [];

  itemsPerLoad = 5;
  peakHour = '--:--';

  constructor(
    private alertCtrl: AlertController,
    private parkingService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadRealData();
  }

  // Extrae los datos de la base de datos
  loadRealData() {
    this.parkingService.getStats().subscribe({
      next: (data) => {
        if (data) this.stats = data;
      },
      error: (err) => console.error('Error al cargar estadísticas', err)
    });

    this.parkingService.getAlerts().subscribe({
      next: (data) => this.alerts = data,
      error: (err) => console.error('Error al cargar alertas', err)
    });

    this.parkingService.getVehicles().subscribe({
      next: (data) => {
        this.vehicles = data;
        this.visibleVehicles = this.vehicles.slice(0, this.itemsPerLoad);
      },
      error: (err) => console.error('Error al cargar vehículos', err)
    });
  }

  // Scroll infinito
  onIonInfinite(ev: any) {
    setTimeout(() => {
      const next = this.vehicles.slice(
        this.visibleVehicles.length,
        this.visibleVehicles.length + this.itemsPerLoad
      );
      this.visibleVehicles = [...this.visibleVehicles, ...next];
      ev.target.complete();

      if (this.visibleVehicles.length >= this.vehicles.length) {
        ev.target.disabled = true;
      }
    }, 600);
  }

  // Registrar vehículo
  async openAddVehicleModal() {
    const modal = await this.alertCtrl.create({
      header: 'Registrar Vehículo',
      inputs: [
        { name: 'plate', type: 'text', placeholder: 'Placa del vehículo' },
        { name: 'type', type: 'text', placeholder: 'Tipo de vehículo' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Registrar',
          handler: (data) => {
            if (!data.plate || !data.type) return;

            const newVehicle = {
              plate: data.plate,
              type: data.type
            };

            this.parkingService.addVehicle(newVehicle).subscribe({
              next: () => {
                this.loadRealData(); // Recarga la BD para ver los lugares actualizados
              },
              error: (err) => console.error('Error al guardar vehículo', err)
            });
          }
        }
      ]
    });
    await modal.present();
  }

  // Cobrar salida
  async openChargeModal(vehicle: Vehicle) {
    if (!vehicle.id) return;

    const now = new Date();
    const entryTimeMs = new Date(vehicle.entryTime).getTime();
    const diffMs = now.getTime() - entryTimeMs;
    const diffHours = diffMs / (1000 * 60 * 60);
    const hoursToCharge = Math.ceil(diffHours > 0 ? diffHours : 1);
    const rate = 15;
    const total = hoursToCharge * rate;

    const modal = await this.alertCtrl.create({
      header: 'Cobrar Vehículo',
      message: `Tiempo estacionado: ${hoursToCharge} hora(s)\nTarifa: $15 por hora\nTotal a pagar: $${total}`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cobrar',
          handler: () => {
            // Formato datetime para MySQL
            const exitTimeFormatted = now.toISOString().slice(0, 19).replace('T', ' ');

            const exitData = {
              exitTime: exitTimeFormatted,
              price: total,
              status: 'Salida'
            };

            this.parkingService.chargeVehicle(vehicle.id!, exitData).subscribe({
              next: () => {
                this.loadRealData(); // Recarga la BD para reflejar ingresos y lugares
              },
              error: (err) => console.error('Error al procesar cobro', err)
            });
          }
        }
      ]
    });
    await modal.present();
  }

  // Editar capacidad total y guardarlo en la Base de Datos
  async editTotalSpaces() {
    const modal = await this.alertCtrl.create({
      header: 'Editar espacios del estacionamiento',
      inputs: [
        {
          name: 'spaces',
          type: 'number',
          value: this.stats.totalSpaces,
          placeholder: 'Total de lugares'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            const newTotal = Number(data.spaces);

            if (newTotal > 0) {
              // Manda el nuevo número al backend
              this.parkingService.updateTotalSpaces(newTotal).subscribe({
                next: () => {
                  // Vuelve a consultar la base de datos para refrescar la pantalla
                  this.loadRealData();
                },
                error: (err) => console.error('Error al actualizar espacios', err)
              });
            }
          }
        }
      ]
    });
    await modal.present();
  }

  async logout() {

  const alert = await this.alertCtrl.create({
    header: 'Cerrar sesión',
    message: '¿Seguro que deseas cerrar sesión?',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Cerrar sesión',
        handler: () => {

          localStorage.removeItem('token');
          localStorage.removeItem('user');

          this.router.navigate(['/login']);

        }
      }
    ]
  });

  await alert.present();
}

}
