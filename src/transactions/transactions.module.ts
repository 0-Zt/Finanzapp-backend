import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { DbPostgresqlService } from 'src/shared/connection/db.postgresql.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [TransactionsService, DbPostgresqlService],
  controllers: [TransactionsController],
})
export class TransactionsModule {}
