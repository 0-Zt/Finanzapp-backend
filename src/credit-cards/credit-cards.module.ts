import { Module } from '@nestjs/common';
import { CreditCardsService } from './credit-cards.service';
import { CreditCardsController } from './credit-cards.controller';
import { DbPostgresqlService } from 'src/shared/connection/db.postgresql.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [CreditCardsService, DbPostgresqlService],
  controllers: [CreditCardsController],
  exports: [CreditCardsService],
})
export class CreditCardsModule {}
