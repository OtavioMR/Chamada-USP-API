import { Test, TestingModule } from '@nestjs/testing';
import { ChamadaJanelaController } from './chamada-janela.controller';

describe('ChamadaJanelaController', () => {
  let controller: ChamadaJanelaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChamadaJanelaController],
    }).compile();

    controller = module.get<ChamadaJanelaController>(ChamadaJanelaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
