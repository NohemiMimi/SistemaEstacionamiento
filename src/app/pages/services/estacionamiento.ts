import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  totalSpaces: number;
  occupiedSpaces: number;
  availableSpaces: number;
  dailyIncome: number;
}

export interface Vehicle {
  id?: string;
  plate: string;
  type: string;
  entryTime: Date;
  exitTime?: string;
  price?: number;
  status: 'Dentro' | 'Salida';
}

export interface Alert {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // Cambia esta URL si tu backend usa otro puerto
  api = 'https://web-production-ea749.up.railway.app';

  constructor(private http: HttpClient) {}

  // -------------------
  // USUARIOS
  // -------------------

  registrar(datos: any) {
    return this.http.post(this.api + '/usuarios', datos);
  }

  login(datos: any) {
    return this.http.post(this.api + '/login', datos);
  }

  // -------------------
  // DASHBOARD
  // -------------------

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(this.api + '/stats');
  }

  updateTotalSpaces(spaces: number): Observable<any> {
    return this.http.put(this.api + '/stats/spaces', { totalSpaces: spaces });
  }

  // -------------------
  // VEHICULOS
  // -------------------

  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(this.api + '/vehicles');
  }

  addVehicle(vehicle: Partial<Vehicle>): Observable<Vehicle> {
    return this.http.post<Vehicle>(this.api + '/vehicles', vehicle);
  }

  chargeVehicle(vehicleId: string, chargeData: any): Observable<any> {
    return this.http.put(this.api + '/vehicles/' + vehicleId + '/charge', chargeData);
  }

  // -------------------
  // ALERTAS
  // -------------------

  getAlerts(): Observable<Alert[]> {
    return this.http.get<Alert[]>(this.api + '/alerts');
  }

  //generar QR
  crearQR(): Observable<any> {
  return this.http.post(this.api + '/crear-qr', {});
}
//salida QR
salidaQR(qrToken: string): Observable<any> {
  return this.http.post(this.api + '/salida', { qrToken });
}

validarQR(qrToken: string) {
  return this.http.post(this.api + '/validar-qr', { qrToken });
}

// -------------------
// ENTRADA MANUAL
// -------------------
registerManualEntry(placa: string): Observable<any> {
  return this.http.post(this.api + '/entrada-manual', { placa });
}
}