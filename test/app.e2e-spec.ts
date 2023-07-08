import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { SignUpDto, SignInDto } from '../src/auth/dto';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();
    await app.listen(4000);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:4000');
  });

  afterAll(() => app.close());

  describe('Auth', () => {
    describe('Sign Up', () => {
      const dto: SignUpDto = {
        firstName: 'Nnamdi',
        lastName: 'Umeh',
        email: 'ohthatendy@gmail.com',
        password: '12345',
      };

      it('should sign up a new user', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201)
          .expectBodyContains('access_token');
      });
    });

    describe('Sign In', () => {
      const dto: SignInDto = {
        email: 'ohthatendy@gmail.com',
        password: '12345',
      };

      it('should sign up a new user', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .stores('user_At', 'access_token')
          .expectStatus(200)
          .expectBodyContains('access_token');
      });
    });
  });

  describe('Books', () => {
    describe('Get books', () => {
      it('should get all books', () => {
        return pactum
          .spec()
          .get('/books')
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});
