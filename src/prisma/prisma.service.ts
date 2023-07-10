import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(configService: ConfigService) {
    super({
      datasources: {
        db: { url: configService.get('DATABASE_URL') },
      },
    });
  }

  cleanDb() {
    return this.$transaction([
      this.comment.deleteMany(),
      this.rating.deleteMany(),
      this.book.deleteMany(),
      this.category.deleteMany(),
      this.user.deleteMany(),
    ]);
  }
}
