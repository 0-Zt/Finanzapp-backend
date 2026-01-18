import { Module } from '@nestjs/common';
import { UpcomingPaymentsService } from './upcoming-payments.service';
import { UpcomingPaymentsController } from './upcoming-payments.controller';
import { DbPostgresqlService } from 'src/shared/connection/db.postgresql.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [UpcomingPaymentsService, DbPostgresqlService],
  controllers: [UpcomingPaymentsController],
})
export class UpcomingPaymentsModule {}
