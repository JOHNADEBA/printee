import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import Stripe from 'stripe';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  private stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      throw new Error(
        'STRIPE_SECRET_KEY is not defined in environment variables',
      );
    }
    if (!stripeKey.startsWith('sk_')) {
      throw new Error(
        'STRIPE_SECRET_KEY must be a secret key (starts with sk_), not a publishable key',
      );
    }
    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2025-02-24.acacia', // Use the latest version as of March 2025
    });
  }

  async create(
    createUserDto: Prisma.UserCreateInput,
  ): Promise<{ user: User; token: string }> {
    const user = await this.findOne(createUserDto.clerkUserId, true, false);
    const createdUser =
      user || (await this.prisma.user.create({ data: createUserDto }));

    if (!createdUser.isActive) {
      throw new BadRequestException('User is inactive');
    }

    const token = this.jwtService.sign({
      id: createdUser.id,
      clerkUserId: createdUser.clerkUserId,
    });
    return { user: createdUser, token };
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findOne(
    id: number | string,
    isClerkUserId = false,
    throwIfNotFound = true,
  ): Promise<User> {
    const where = isClerkUserId
      ? { clerkUserId: String(id) }
      : { id: Number(id) };
    const user = await this.prisma.user.findUnique({ where });
    if (!user && throwIfNotFound) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  async update(
    id: number,
    updateUserDto: Prisma.UserUpdateInput,
  ): Promise<User> {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: number): Promise<User> {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async createPaymentIntent(amount: number, clerkUserId: string) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const user = await this.prisma.user.findUnique({ where: { clerkUserId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Amount in cents (e.g., 10 coins = eur10 = 1000 cents)
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'eur', // Adjust as needed
      metadata: { clerkUserId, coins: amount },
    });

    return { clientSecret: paymentIntent.client_secret };
  }

  async confirmPayment(paymentIntentId: string) {
    const paymentIntent =
      await this.stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException('Payment not completed');
    }

    const clerkUserId = paymentIntent.metadata.clerkUserId;
    const coins = parseInt(paymentIntent.metadata.coins, 10);

    const user = await this.prisma.user.update({
      where: { clerkUserId },
      data: { coins: { increment: coins } },
    });

    return { coins: user.coins };
  }
}
