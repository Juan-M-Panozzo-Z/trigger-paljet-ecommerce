import { Test, TestingModule } from '@nestjs/testing';
import { PaljetSyncService } from './paljet-sync.service';

describe('PaljetSyncService', () => {
  let service: PaljetSyncService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaljetSyncService],
    }).compile();

    service = module.get<PaljetSyncService>(PaljetSyncService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
