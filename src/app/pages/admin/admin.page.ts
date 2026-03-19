import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { ApiService, DashboardStats, Vehicle, Alert } from '../services/estacionamiento';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

@Component({
  selector: 'app-home',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HttpClientModule, FormsModule]
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

  scannedVehicle: any = null;

  showExitModal = false;
  exitTime = '12:30 PM';
  totalTime = '2 hrs 30 min';
  totalAmount = 50;
  paymentMethod = '';

  constructor(
    private alertCtrl: AlertController,
    private parkingService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadRealData();
  }

  get kpis() {
    return [
      {
        title: 'Estacionamientos Totales',
        value: this.stats.totalSpaces,
        color: 'color1',
        button: 'Editar Lugares',
        action: () => this.editTotalSpaces()
      },
      { title: 'Lugares Ocupados', value: this.stats.occupiedSpaces, color: 'color2' },
      { title: 'Lugares Disponibles', value: this.stats.availableSpaces, color: 'color3' },
      { title: 'Ingresos del Día', value: `$${this.stats.dailyIncome}`, color: 'color4' },
      { title: 'Hora con más ingresos', value: this.peakHour, color: 'color5' }
    ];
  }

  loadRealData() {
    this.parkingService.getStats().subscribe(d => d && (this.stats = d));
    this.parkingService.getAlerts().subscribe(d => this.alerts = d);
    this.parkingService.getVehicles().subscribe(d => {
      this.vehicles = d;
      this.visibleVehicles = d.slice(0, this.itemsPerLoad);
    });
  }

  onIonInfinite(ev: any) {
    const next = this.vehicles.slice(
      this.visibleVehicles.length,
      this.visibleVehicles.length + this.itemsPerLoad
    );
    this.visibleVehicles = [...this.visibleVehicles, ...next];
    ev.target.complete();
    if (this.visibleVehicles.length >= this.vehicles.length) ev.target.disabled = true;
  }

  async openAddVehicleModal() {
    const modal = await this.alertCtrl.create({
      header: 'Registrar Vehículo',
      inputs: [
        { name: 'plate', type: 'text', placeholder: 'Placa' },
        { name: 'type', type: 'text', placeholder: 'Tipo' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Registrar',
          handler: (data) => {
            if (!data.plate || !data.type) return;
            this.parkingService.addVehicle(data).subscribe(() => this.loadRealData());
          }
        }
      ]
    });
    await modal.present();
  }

  async openChargeModal(vehicle: Vehicle) {
    if (!vehicle.id) return;

    const now = new Date();
    const hours = Math.ceil((now.getTime() - new Date(vehicle.entryTime).getTime()) / 3600000);
    const total = hours * 15;

    const modal = await this.alertCtrl.create({
      header: 'Cobro',
      message: `Tiempo: ${hours}h\nTotal: $${total}`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cobrar',
          handler: () => {
            const exitTime = now.toISOString().slice(0, 19).replace('T', ' ');
            this.parkingService.chargeVehicle(vehicle.id!, {
              exitTime,
              price: total,
              status: 'Salida'
            }).subscribe(() => this.loadRealData());
          }
        }
      ]
    });

    await modal.present();
  }

  async editTotalSpaces() {
    const modal = await this.alertCtrl.create({
      header: 'Editar espacios',
      inputs: [{ name: 'spaces', type: 'number', value: this.stats.totalSpaces }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (d) => d.spaces > 0 &&
            this.parkingService.updateTotalSpaces(d.spaces)
              .subscribe(() => this.loadRealData())
        }
      ]
    });
    await modal.present();
  }

  abrirSalidaModal() {
    this.showExitModal = true;
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Seguro?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salir',
          handler: () => {
            localStorage.clear();
            this.router.navigate(['/login']);
          }
        }
      ]
    });
    await alert.present();
  }

  async scanQR() {
  try {

    const permission = await BarcodeScanner.requestPermissions();

    if (permission.camera !== 'granted') {
      alert('Sin permiso de cámara');
      return;
    }

    const result = await BarcodeScanner.scan();

    // 🔴 DETENER ESCÁNER (CLAVE)
    await BarcodeScanner.stopScan();

    if (result.barcodes.length === 0) {
      alert('No se detectó QR');
      return;
    }

    const qrToken = result.barcodes[0].rawValue;

    if (!qrToken) {
      alert('QR inválido');
      return;
    }

    this.parkingService.validarQR(qrToken).subscribe((res: any) => {

      if (res.success) {

        const data = res.data;

        this.scannedVehicle = {
          id: data.id,
          plate: data.placa,
          entryTime: data.horaEntrada,
          status: data.estado === 'dentro' ? 'Dentro' : 'Salida'
        };

      } else {
        alert('QR no válido');
      }

    });

  } catch (e) {
    console.error(e);

    // 🔴 TAMBIÉN DETENER EN ERROR
    await BarcodeScanner.stopScan();

    alert('Error al escanear');
  }
}
  
}