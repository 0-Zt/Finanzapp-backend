import { Module } from '@nestjs/common';
import { MonthlyAutomationService } from './monthly-automation.service';
import { UserProfileModule } from '../user-profile/user-profile.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [UserProfileModule, AuthModule],
  providers: [MonthlyAutomationService],
  exports: [MonthlyAutomationService],
})
export class MonthlyAutomationModule {}
