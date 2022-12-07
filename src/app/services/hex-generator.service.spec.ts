import { TestBed } from '@angular/core/testing';

import { HexGeneratorService } from './hex-generator.service';

describe('HexGeneratorService', () => {
  let service: HexGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HexGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
