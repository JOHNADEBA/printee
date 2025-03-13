import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Prisma, User } from '@prisma/client';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Public()
  create(
    @Body() createUserDto: Prisma.UserCreateInput,
  ): Promise<{ user: User; token: string }> {
    return this.userService.create(createUserDto);
  }

  @Post('create-payment-intent')
  @UseGuards(JwtAuthGuard)
  async createPaymentIntent(@Body('amount') amount: number, @Req() req) {
    const clerkUserId = req.user?.clerkUserId;
    return this.userService.createPaymentIntent(amount, clerkUserId);
  }

  @Post('confirm-payment')
  @UseGuards(JwtAuthGuard)
  async confirmPayment(@Body('paymentIntentId') paymentIntentId: string) {
    return this.userService.confirmPayment(paymentIntentId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: Prisma.UserUpdateInput,
  ): Promise<User> {
    return this.userService.update(+id, updateUserDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string): Promise<User> {
    return this.userService.remove(+id);
  }
}
