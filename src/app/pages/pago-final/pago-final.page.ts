import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { ApiService } from '../services/estacionamiento';
import { LogoutButtonComponent } from '../logout-button/logout-button.component';


import QRCode from 'qrcode';

@Component({
  selector: 'app-pago-final',
  templateUrl: './pago-final.page.html',
  styleUrls: ['./pago-final.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, LogoutButtonComponent]
})
export class PagoFinalPage implements OnInit {

  qrToken: string = '';
  qrImage: string = '';
  precio: number = 0;
  tiempo: number = 0;
  cargando: boolean = false;

  constructor(
    private api: ApiService,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    // se obtiene token guardado
    this.qrToken = localStorage.getItem('qrToken') || '';

    if (this.qrToken) {
      this.generarQR();   // genera QR otra vez
      this.calcularPago(); //calcula pago
    } else {
      console.warn('No hay QR token');
    }
  }

  // genera imagen del QR
  generarQR() {
    QRCode.toDataURL(this.qrToken)
      .then((url: string) => {
        this.qrImage = url;
      })
      .catch((err: any) => {
        console.error('Error generando QR:', err);
      });
  }

  // calcula pago desde backend
  calcularPago() {
  this.cargando = true;

  this.api.previewPago(this.qrToken).subscribe({
    next: (res: any) => {
      this.cargando = false;

      if (res.success) {
        this.precio = res.data.precio;
        // opcional si luego quieres tiempo:
        // this.tiempo = res.data.tiempo;
      } else {
        console.error('No se pudo calcular el pago');
      }
    },
    error: (err) => {
      this.cargando = false;
      console.error('Error al calcular pago:', err);
    }
  });
}


  regresar() {
    this.navCtrl.back();
  }
}