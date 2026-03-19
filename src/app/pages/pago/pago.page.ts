import { Component, OnInit } from '@angular/core';
import { NavController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import QRCode from 'qrcode';
import { ApiService } from '../services/estacionamiento';

@Component({
  selector: 'app-pago',
  templateUrl: './pago.page.html',
  styleUrls: ['./pago.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class PagoPage implements OnInit {

  qrImage: string = '';
  qrToken: string = '';

  constructor(
    private navCtrl: NavController,
    private api: ApiService
  ) {}

  ngOnInit() {
    this.obtenerQR();
  }

  // 🔥 obtiene el QR desde backend
  obtenerQR() {
    this.api.crearQR().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.qrToken = res.qrToken;
          localStorage.setItem('qrToken', this.qrToken);
          this.generarQR();
        }
      },
      error: (err) => {
        console.error('Error al obtener QR:', err);
      }
    });
  }

  // 🔹 genera la imagen del QR
  generarQR() {
    QRCode.toDataURL(this.qrToken)
      .then((url: string) => {
        this.qrImage = url;
      })
      .catch((err: any) => {
        console.error('Error generando QR:', err);
      });
  }

  irAPagoFinal() {
    this.navCtrl.navigateForward('/pago-final');
  }
}