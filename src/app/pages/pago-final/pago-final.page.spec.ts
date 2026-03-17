import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PagoFinalPage } from './pago-final.page';

describe('PagoFinalPage', () => {
  let component: PagoFinalPage;
  let fixture: ComponentFixture<PagoFinalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PagoFinalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
