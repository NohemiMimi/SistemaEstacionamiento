import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonItem,
  IonLabel,
  AlertController
} from '@ionic/angular/standalone';
import { ApiService, DashboardStats, Alert } from '../services/estacionamiento';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { notificationsOutline, personCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [
  CommonModule,
  FormsModule,

  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonItem,
  IonLabel
]
})
export class AdminPage implements OnInit {

  stats: DashboardStats = {
    totalSpaces: 0,
    occupiedSpaces: 0,
    availableSpaces: 0,
    dailyIncome: 0
  };

  vehicles: any[] = [];
  alerts: Alert[] = [];

  parkingFullAlertShown = false;

  constructor(
    private alertCtrl: AlertController,
    private parkingService: ApiService
  ) {
    addIcons({ notificationsOutline, personCircleOutline });
  }

  ngOnInit() {
    this.loadRealData();

    setInterval(() => {
      this.loadRealData();
    }, 3000);
  }

  // =========================
  // CARGAR DATOS
  // =========================
  loadRealData() {

    this.parkingService.getStats().subscribe(async d => {
      if (d) {
        this.stats = d;

        if (this.stats.occupiedSpaces >= this.stats.totalSpaces) {

          if (!this.parkingFullAlertShown) {

            const alert = await this.alertCtrl.create({
              header: '🚫 Estacionamiento lleno',
              message: 'Ya no hay lugares disponibles.',
              buttons: ['OK']
            });

            await alert.present();
            this.parkingFullAlertShown = true;
          }

        } else {
          this.parkingFullAlertShown = false;
        }
      }
    });

    this.parkingService.getVehicles().subscribe((d: any) => {
      this.vehicles = d;
    });
  }

  // =========================
  // REGISTRO MANUAL
  // =========================
  async registerManualEntry() {
    const alert = await this.alertCtrl.create({
      header: 'Registrar Entrada Manual',
      inputs: [
        { name: 'placa', type: 'text', placeholder: 'Ej: ABC-123' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Registrar',
          handler: (data) => {
            if (!data.placa) return;

            this.parkingService.registerManualEntry(data.placa)
              .subscribe(() => this.loadRealData());
          }
        }
      ]
    });

    await alert.present();
  }

  // =========================
  // ESCANEAR QR
  // =========================
  async scanQR() {
    try {
      const { BarcodeScanner } = await import('@capacitor-mlkit/barcode-scanning');

      const permission = await BarcodeScanner.requestPermissions();
      if (permission.camera !== 'granted') return;

      const result = await BarcodeScanner.scan();
      await BarcodeScanner.stopScan();

      if (result.barcodes.length === 0) return;

      const qrToken = result.barcodes[0].rawValue;

      if (!qrToken) {
        const alerta = await this.alertCtrl.create({
          header: 'Error',
          message: 'QR inválido',
          buttons: ['OK']
        });
        await alerta.present();
        return;
      }

      this.parkingService.validarQR(qrToken).subscribe(async (res: any) => {

  if (!res.success) {
    const alerta = await this.alertCtrl.create({
      header: 'Error',
      message: 'QR no válido',
      buttons: ['OK']
    });
    await alerta.present();
    return;
  }

  const data = res.data;

  // 🔥 SOLO DECIDES QUÉ HACER
  if (data.estado === 'pendiente') {
    this.handleEntrada(qrToken, data);
  } 
  else if (data.estado === 'dentro') {
    this.handleSalida(qrToken);
  } 
  else {
    const alerta = await this.alertCtrl.create({
      header: 'Aviso',
      message: 'Este vehículo ya salió 🚗',
      buttons: ['OK']
    });
    await alerta.present();
  }

});

    } catch (e) {
      console.error(e);
    }
  }

  // =========================
  // ENTRADA
  // =========================
  async handleEntrada(qrToken: string, data: any) {

    const confirm = await this.alertCtrl.create({
      header: 'Validar acceso',
      message: `
        🚗 Placa: ${data.placa} <br>
        Estado: ${data.estado}
      `,
      buttons: [
        {
          text: 'Rechazar',
          role: 'cancel'
        },
        {
          text: 'Aceptar',
          handler: () => {

            this.parkingService.aceptarQR(qrToken)
              .subscribe(async (resp: any) => {

                if (resp.success) {

                  const ok = await this.alertCtrl.create({
                    header: 'Acceso permitido',
                    message: 'El vehículo ha entrado 🚗',
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

    await confirm.present();
  }

  // =========================
  // SALIDA (QR CON MÉTODO DE PAGO)
  // =========================
  async handleSalida(qrToken: string) {

    this.parkingService.previewPago(qrToken).subscribe(async (res: any) => {

      if (!res.success) {
        const alerta = await this.alertCtrl.create({
          header: 'Error',
          message: 'QR inválido o no disponible para salida',
          buttons: ['OK']
        });
        await alerta.present();
        return;
      }

      const data = res.data;

      const confirm = await this.alertCtrl.create({
        header: 'Cobro de estacionamiento',
        message: `
          🚗 Placa: ${data.placa} <br>
          💰 Total: $${data.precio}
        `,
        inputs: [
          {
            type: 'radio',
            label: 'Efectivo',
            value: 'efectivo',
            checked: true
          },
          {
            type: 'radio',
            label: 'Tarjeta',
            value: 'tarjeta'
          }
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Confirmar Pago',
            handler: (metodo) => {

              this.parkingService.confirmarPago(qrToken, metodo)
                .subscribe(async (resp: any) => {

                  if (resp.success) {

                    const ok = await this.alertCtrl.create({
                      header: 'Pago realizado',
                      message: `Total pagado: $${resp.precio}`,
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

      await confirm.present();

    });
  }

  // =========================
  // COBRO DESDE LISTA
  // =========================
  async openChargeModal(vehicle: any) {

    // 🔥 SI TIENE QR → flujo nuevo
    if (vehicle.qrToken) {
      this.handleSalida(vehicle.qrToken);
      return;
    }

    // 🔥 SI ES MANUAL → flujo viejo
    const modal = await this.alertCtrl.create({
      header: 'Cobrar',
      message: '¿Deseas cobrar este vehículo?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cobrar',
          handler: () => {

            this.parkingService.salidaQR(vehicle.qrToken)
              .subscribe(async (res: any) => {

                if (res.success) {

                  const ok = await this.alertCtrl.create({
                    header: 'Cobrado',
                    message: `Total: $${res.precio}`,
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

    await modal.present();
  }

  // =========================
  // LOGOUT
  // =========================
  logout() {
    localStorage.clear();
    window.location.href = '/login';
  }

}