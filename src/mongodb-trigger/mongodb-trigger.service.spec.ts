import { Test, TestingModule } from '@nestjs/testing';
import { MongodbTriggerService } from './mongodb-trigger.service';

describe('MongodbTriggerService', () => {
  let service: MongodbTriggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MongodbTriggerService],
    }).compile();

    service = module.get<MongodbTriggerService>(MongodbTriggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
