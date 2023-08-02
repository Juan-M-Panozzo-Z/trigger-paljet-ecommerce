import { Test, TestingModule } from '@nestjs/testing';
import { FirebirdService } from './firebird.service';

describe('FirebirdService', () => {
  let service: FirebirdService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FirebirdService],
    }).compile();

    service = module.get<FirebirdService>(FirebirdService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
