import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { DbPostgresqlService } from '../shared/connection/db.postgresql.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [CategoriesService, DbPostgresqlService],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
