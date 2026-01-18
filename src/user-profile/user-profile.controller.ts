import { Controller, Get, Put, Post, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateFixedExpenseDto } from './dto/create-fixed-expense.dto';
import { UpdateFixedExpenseDto } from './dto/update-fixed-expense.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/current-user.decorator';

@Controller('profile')
@UseGuards(AuthGuard)
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Get()
  async getProfile(@CurrentUser() user: CurrentUserData) {
    return await this.userProfileService.getProfile(user.id, user.email, user.fullName, user.accessToken);
  }

  @Put()
  async updateProfile(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: UpdateProfileDto,
  ) {
    return await this.userProfileService.updateProfile(
      user.id,
      dto,
      user.email,
      user.fullName,
      user.accessToken
    );
  }

  @Get('fixed-expenses')
  async getFixedExpenses(@CurrentUser() user: CurrentUserData) {
    return await this.userProfileService.getFixedExpenses(user.id, user.accessToken);
  }

  @Post('fixed-expenses')
  async createFixedExpense(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateFixedExpenseDto,
  ) {
    return await this.userProfileService.createFixedExpense(user.id, dto, user.accessToken);
  }

  @Put('fixed-expenses/:id')
  async updateFixedExpense(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFixedExpenseDto,
  ) {
    return await this.userProfileService.updateFixedExpense(user.id, id, dto, user.accessToken);
  }

  @Delete('fixed-expenses/:id')
  async deleteFixedExpense(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.userProfileService.deleteFixedExpense(user.id, id, user.accessToken);
  }
}
