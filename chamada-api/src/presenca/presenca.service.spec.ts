import { Test, TestingModule } from '@nestjs/testing';
import { PresencaService } from './presenca.service';

describe('PresencaService', () => {
  let service: PresencaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PresencaService],
    }).compile();

    service = module.get<PresencaService>(PresencaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
