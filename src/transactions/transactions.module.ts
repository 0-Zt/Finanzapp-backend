import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { DbPostgresqlService } from 'src/shared/connection/db.postgresql.service';

@Module({
  providers: [TransactionsService,DbPostgresqlService],
  controllers: [TransactionsController]
})
export class TransactionsModule {}
