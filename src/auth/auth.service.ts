import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignUpDto } from './dto/sign-up.dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { SignInDto } from './dto';
import { Role } from './enums';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  //signup service
  async signUp(dto: SignUpDto) {
    try {
      const hash = await argon.hash(dto.password);
      const { password, ...userDetails } = dto;

      //create user with encrypted password
      const user = await this.prisma.user.create({
        data: {
          roles: Role.USER,
          password: hash,
          ...userDetails,
        },
      });

      //create jwt token
      return this.signToken(user.id, user.email);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e?.code === 'P2002') {
          throw new ForbiddenException('Email already exists');
        }
      }
    }
  }

  async signIn(dto: SignInDto) {
    //get user
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new NotFoundException('invalid credentials');
    }

    //compare password
    const isValid = await argon.verify(user.password, dto.password);

    if (!isValid) throw new ForbiddenException('Invalid credentials');

    //send token
    return this.signToken(user.id, user.email);
  }

  async signToken(
    userId: string,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };

    const secret = this.config.get('JWT_SECRET');

    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret,
    });

    return { access_token };
  }
}
