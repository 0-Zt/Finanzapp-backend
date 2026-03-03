import { Test, TestingModule } from '@nestjs/testing';
import { FinancialGoalsController } from './financial-goals.controller';
import { FinancialGoalsService } from './financial-goals.service';
import { AuthService } from '../auth/auth.service';

describe('FinancialGoalsController', () => {
  let controller: FinancialGoalsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinancialGoalsController],
      providers: [
        {
          provide: FinancialGoalsService,
          useValue: {},
        },
        {
          provide: AuthService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<FinancialGoalsController>(FinancialGoalsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
