import { Test, TestingModule } from '@nestjs/testing';
import { PaljetSyncController } from './paljet-sync.controller';

describe('PaljetSyncController', () => {
  let controller: PaljetSyncController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaljetSyncController],
    }).compile();

    controller = module.get<PaljetSyncController>(PaljetSyncController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
