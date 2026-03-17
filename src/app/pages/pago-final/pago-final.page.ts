import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-pago-final',
  templateUrl: './pago-final.page.html',
  styleUrls: ['./pago-final.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class PagoFinalPage {
  constructor() {}
}