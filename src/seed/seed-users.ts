// import { hash } from 'bcrypt';
// import { Gender, PrismaClient, Role } from 'prisma/generated/prisma/client';

// export const seedUsers = async (prisma: PrismaClient) => {
//   console.log('  ➤ Seeding users...');

//   const hashedPassword = await hash('Password123!', 10);

//   await prisma.user.upsert({
//     where: { email: 'matias@mail.com' },
//     update: {
//       name: 'Matías Tailler',
//       gender: Gender.MALE,
//       role: Role.USER,
//     },
//     create: {
//       name: 'Matías Tailler',
//       email: 'matias@mail.com',
//       birthDate: new Date(1986, 5, 19),
//       password: hashedPassword,
//       gender: Gender.MALE,
//       role: Role.USER,
//     },
//   });

//   console.log('  ✔ Users seeded');
// };
