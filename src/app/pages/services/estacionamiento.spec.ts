import { TestBed } from '@angular/core/testing';

import { Estacionamiento } from './estacionamiento';

describe('Estacionamiento', () => {
  let service: Estacionamiento;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Estacionamiento);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
