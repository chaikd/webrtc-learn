import { TestBed } from '@angular/core/testing';

import { WssService } from './wss.service';

describe('WssService', () => {
  let service: WssService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WssService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
