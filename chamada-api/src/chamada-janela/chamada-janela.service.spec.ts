import { Test, TestingModule } from '@nestjs/testing';
import { ChamadaJanelaService } from './chamada-janela.service';

describe('ChamadaJanelaService', () => {
  let service: ChamadaJanelaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChamadaJanelaService],
    }).compile();

    service = module.get<ChamadaJanelaService>(ChamadaJanelaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
