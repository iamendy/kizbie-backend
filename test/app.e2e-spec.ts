import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { faker } from '@faker-js/faker';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { SignUpDto, SignInDto } from '../src/auth/dto';
import { Role } from '../src/auth/enums';
import { CreateBookDto } from '../src/book/dto/create-book.dto';

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
    //await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:4000');
  });

  afterAll(() => app.close());

  describe('Auth', () => {
    //user details
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({
      firstName,
      lastName,
      provider: 'yahoo.com',
    });

    //Signup test
    describe('Sign Up', () => {
      const dto: SignUpDto = {
        firstName,
        lastName,
        email,
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

    //Signin test
    describe('Sign In', () => {
      const dto: SignInDto = {
        email,
        password: '12345',
      };

      it('should sign in a new user', () => {
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

  //Editor test
  describe('Editor', () => {
    let editorEmail: string;

    //get editor details from db
    it('Should fetch editor', async () => {
      const editor = await prisma.user.findFirst({
        where: {
          roles: Role.EDITOR,
        },
      });

      editorEmail = editor.email;
      expect(editor.roles).toBe(Role.EDITOR);
    });

    //signin editor
    it('should sign in an editor', () => {
      const dto: SignInDto = {
        email: editorEmail,
        password: 'psword',
      };
      return pactum
        .spec()
        .post('/auth/signin')
        .withBody(dto)
        .stores('editor_At', 'access_token')
        .expectStatus(200)
        .expectBodyContains('access_token');
    });
  });

  //Books test
  describe('Books', () => {
    describe('Get books', () => {
      it('should get all books', () => {
        return pactum
          .spec()
          .get('/books')
          .expectStatus(200)

          .expectBodyContains('title');
      });
    });

    //create a new book
    describe('Create new book', () => {
      it('should create a new book by editor', async () => {
        const editor = await prisma.user.findFirst({
          where: {
            roles: Role.EDITOR,
          },
        });
        const category = await prisma.category.findFirst();
        const bookDto: CreateBookDto = {
          author: `${faker.person.firstName()} ${faker.person.lastName()}`,
          title: `${faker.word.words(4)}`,
          categoryId: category.id,
          intro: `${faker.lorem.lines(10)}`,
          tagline: `${faker.lorem.sentence(4)}`,
          price: `${faker.string.numeric(2)}`,
        };

        return pactum
          .spec()
          .post('/books')
          .withBody(bookDto)
          .withHeaders({
            Authorization: 'Bearer $S{editor_At}',
          })
          .inspect()
          .expectStatus(201)
          .expectBodyContains('title');
      });
    });
  });
});
