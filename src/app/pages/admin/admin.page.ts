import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { ApiService, DashboardStats, Vehicle, Alert } from '../services/estacionamiento';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { notificationsOutline, personCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class AdminPage implements OnInit {

  stats: DashboardStats = {
    totalSpaces: 0,
    occupiedSpaces: 0,
    availableSpaces: 0,
    dailyIncome: 0
  };

  vehicles: Vehicle[] = [];
  alerts: Alert[] = [];
  peakHour = '--:--';

  scannedVehicle: any = null;

  constructor(
    private alertCtrl: AlertController,
    private parkingService: ApiService
  ) {
    addIcons({ notificationsOutline, personCircleOutline });
  }

  ngOnInit() {
    this.loadRealData();
  }

  loadRealData() {
    this.parkingService.getStats().subscribe(d => d && (this.stats = d));
    this.parkingService.getAlerts().subscribe(d => this.alerts = d);
    this.parkingService.getVehicles().subscribe(d => {
      this.vehicles = d;
    });
  }

  // 🚗 REGISTRO MANUAL
  async registerManualEntry() {
    const alert = await this.alertCtrl.create({
      header: 'Registrar Entrada Manual',
      inputs: [
        {
          name: 'placa',
          type: 'text',
          placeholder: 'Ej: ABC-123'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Registrar',
          handler: (data) => {
            if (!data.placa) return;

            this.parkingService.registerManualEntry(data.placa)
              .subscribe(async (res) => {
                if (res.success) {
                  const ok = await this.alertCtrl.create({
                    header: 'Éxito',
                    message: 'Entrada registrada correctamente',
                    buttons: ['OK']
                  });
                  await ok.present();
                  this.loadRealData();
                }
              });
          }
        }
      ]
    });

    await alert.present();
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
    const hours = Math.ceil(
      (now.getTime() - new Date(vehicle.entryTime).getTime()) / 3600000
    );
    const total = hours * 15;

    const modal = await this.alertCtrl.create({
      header: 'Cobro',
      message: `Tiempo: ${hours}h - Total: $${total}`,
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
      inputs: [
        { name: 'spaces', type: 'number', value: this.stats.totalSpaces }
      ],
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

  async scanQR() {
    try {
      const { BarcodeScanner } = await import('@capacitor-mlkit/barcode-scanning');

      const permission = await BarcodeScanner.requestPermissions();

      if (permission.camera !== 'granted') {
        const alerta = await this.alertCtrl.create({
          header: 'Error',
          message: 'Sin permiso de cámara',
          buttons: ['OK']
        });
        await alerta.present();
        return;
      }

      const result = await BarcodeScanner.scan();
      await BarcodeScanner.stopScan();

      if (result.barcodes.length === 0) {
        const alerta = await this.alertCtrl.create({
          header: 'Aviso',
          message: 'No se detectó QR',
          buttons: ['OK']
        });
        await alerta.present();
        return;
      }

      const qrToken = result.barcodes[0].rawValue;

      // 🔥 VALIDACIÓN CORRECTA (SOLUCIÓN 1)
      if (!qrToken) {
        const alerta = await this.alertCtrl.create({
          header: 'Error',
          message: 'QR inválido',
          buttons: ['OK']
        });
        await alerta.present();
        return;
      }

      // 👇 aquí ya es string seguro
      this.parkingService.validarQR(qrToken).subscribe(async (res: any) => {
        if (res.success) {
          const data = res.data;

          this.scannedVehicle = {
            id: data.id,
            plate: data.placa,
            entryTime: data.horaEntrada,
            status: data.estado === 'dentro' ? 'Dentro' : 'Salida'
          };
        } else {
          const alerta = await this.alertCtrl.create({
            header: 'Error',
            message: 'QR no válido',
            buttons: ['OK']
          });
          await alerta.present();
        }
      });

    } catch (e) {
      console.error('Error al escanear:', e);

      const alerta = await this.alertCtrl.create({
        header: 'Error',
        message: 'Error al escanear QR',
        buttons: ['OK']
      });
      await alerta.present();
    }
  }

  logout() {
    localStorage.clear();
    window.location.href = '/login';
  }
}