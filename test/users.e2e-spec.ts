import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const createdUserIds: string[] = [];

  const buildUserPayload = (suffix: string) => ({
    name: `E2E User ${suffix}`,
    email: `e2e-user-${suffix}@example.com`,
    birthDate: new Date('1990-01-01').toISOString(),
    rawPassword: 'Password1',
    repeatPassword: 'Password1',
    gender: 'MALE',
  });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = app.get(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    if (createdUserIds.length) {
      await prisma.user.deleteMany({
        where: { id: { in: createdUserIds } },
      });
    }
    await app.close();
  });

  it('POST /users should create a user', async () => {
    const payload = buildUserPayload('create');

    const res = await request(app.getHttpServer()).post('/users').send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      name: payload.name,
      email: payload.email,
      gender: payload.gender,
      isActive: true,
    });
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('createdAt');
    expect(res.body).toHaveProperty('updatedAt');
    expect(res.body).not.toHaveProperty('password');

    createdUserIds.push(res.body.id);
  });

  it('GET /users/:id should return the user', async () => {
    const payload = buildUserPayload('get');
    const createRes = await request(app.getHttpServer())
      .post('/users')
      .send(payload);
    createdUserIds.push(createRes.body.id);

    const res = await request(app.getHttpServer()).get(
      `/users/${createRes.body.id}`,
    );

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: createRes.body.id,
      name: payload.name,
      email: payload.email,
      gender: payload.gender,
    });
  });

  it('PATCH /users/:id should update the user', async () => {
    const payload = buildUserPayload('update');
    const createRes = await request(app.getHttpServer())
      .post('/users')
      .send(payload);
    createdUserIds.push(createRes.body.id);

    const newName = 'Updated E2E Name';

    const res = await request(app.getHttpServer())
      .patch(`/users/${createRes.body.id}`)
      .send({ name: newName });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe(newName);
  });

  it('GET /users should list users including newly created one', async () => {
    const payload = buildUserPayload('list');
    const createRes = await request(app.getHttpServer())
      .post('/users')
      .send(payload);
    createdUserIds.push(createRes.body.id);

    const res = await request(app.getHttpServer()).get('/users');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((user) => user.id === createRes.body.id)).toBe(true);
  });

  it('DELETE /users/:id should soft delete the user', async () => {
    const payload = buildUserPayload('delete');
    const createRes = await request(app.getHttpServer())
      .post('/users')
      .send(payload);
    createdUserIds.push(createRes.body.id);

    const deleteRes = await request(app.getHttpServer()).delete(
      `/users/${createRes.body.id}`,
    );
    expect(deleteRes.status).toBe(204);

    const getRes = await request(app.getHttpServer()).get(
      `/users/${createRes.body.id}`,
    );
    expect(getRes.status).toBe(200);
    expect(getRes.body.isActive).toBe(false);
  });
});
