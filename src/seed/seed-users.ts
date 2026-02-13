import { hash } from 'bcrypt';
import { Gender, PrismaClient, Role } from 'prisma/generated/prisma/client';

export const seedUsers = async (prisma: PrismaClient) => {
  console.log('  ➤ Seeding users...');

  const hashedPassword = await hash('Password123!', 10);

  const users = [
    {
      name: 'Matías Tailler',
      email: 'matias@mail.com',
      birthDate: new Date(1986, 5, 19),
      password: hashedPassword,
      gender: Gender.MALE,
      role: Role.USER,
    },
    {
      name: 'John Williams',
      email: 'john@mail.com',
      birthDate: new Date(1986, 5, 19),
      password: hashedPassword,
      gender: Gender.MALE,
      role: Role.USER,
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        birthDate: u.birthDate,
        password: hashedPassword,
        gender: u.gender,
        role: u.role,
      },
    });
  }

  console.log('  ✔ Users seeded');
};
