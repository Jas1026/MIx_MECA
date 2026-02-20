import { TestBed } from '@angular/core/testing';

import { ServerContentService } from './server-content.service';

describe('ServerContentService', () => {
  let service: ServerContentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServerContentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
