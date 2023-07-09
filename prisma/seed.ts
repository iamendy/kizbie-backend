import { Category, PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as argon from 'argon2';
import { Role } from '../src/auth/enums';

const categories = ['adventure', 'sports', 'communication', 'learning', 'fun'];

const main = async () => {
  const prisma = new PrismaClient();

  // clean db
  await prisma.$transaction([
    prisma.rating.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.book.deleteMany(),
    prisma.category.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // create categories table
  for (const cat of categories) {
    await prisma.category.create({
      data: {
        name: cat,
      },
    });
  }

  // get all categories
  const dbCategories = await prisma.category.findMany();

  //create an editor
  const editor = await prisma.user.create({
    data: {
      firstName: `${faker.person.firstName()}`,
      lastName: `${faker.person.lastName()}`,
      email: `${faker.internet.email()}`,
      password: await argon.hash('psword'),
      roles: Role.EDITOR,
    },
  });

  //create books in each category
  for (const dbCat of dbCategories) {
    await prisma.book.create({
      data: {
        author: `${faker.person.firstName()} ${faker.person.lastName()}`,
        title: `${faker.word.words(4)}`,
        category: {
          connect: {
            id: dbCat.id,
          },
        },
        intro: `${faker.lorem.lines(10)}`,
        tagline: `${faker.lorem.sentence(4)}`,
        price: `${faker.string.numeric(2)}`,

        editor: {
          connect: {
            id: editor.id,
          },
        },
      },
    });
  }

  // get all books
  const dbBooks = await prisma.book.findMany();

  console.log(dbBooks);

  //create 3 users
  for (let i: number = 0; i < 3; i++) {
    let firstName = faker.person.firstName();
    let lastName = faker.person.lastName();
    await prisma.user.create({
      data: {
        firstName: `${firstName}`,
        lastName: `${lastName}`,
        email: `${faker.internet.email({
          firstName,
          lastName,
          provider: 'yahoo.com',
        })}`,
        password: await argon.hash('psword'),
        roles: Role.USER,
      },
    });
  }

  //fetch users
  const dbUsers = await prisma.user.findMany({
    where: {
      roles: Role.USER,
    },
  });

  //add user's ratings
  for (const book of dbBooks) {
    for (const user of dbUsers) {
      await prisma.rating.create({
        data: {
          userId: user.id,
          bookId: book.id,
          rating: faker.number.int({ min: 1, max: 5 }),
        },
      });
    }
  }

  //add user's comments to books
  for (const book of dbBooks) {
    for (const user of dbUsers) {
      await prisma.comment.create({
        data: {
          message: faker.lorem.text(),
          user: {
            connect: {
              id: user.id,
            },
          },
          book: {
            connect: {
              id: book.id,
            },
          },
        },
      });
    }
  }
};

main();
