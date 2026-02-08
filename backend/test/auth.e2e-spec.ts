import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    prisma = app.get(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    await prisma.listItem.deleteMany();
    await prisma.listInvite.deleteMany();
    await prisma.listMember.deleteMany();
    await prisma.list.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.listItem.deleteMany();
    await prisma.listInvite.deleteMany();
    await prisma.listMember.deleteMany();
    await prisma.list.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user).toMatchObject({
        name: testUser.name,
        email: testUser.email,
      });
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('should fail with invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...testUser, email: 'invalid' })
        .expect(400);
    });

    it('should fail with short password', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...testUser, password: '123' })
        .expect(400);
    });

    it('should fail with duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(409);
    });
  });

  describe('/auth/login (POST)', () => {
    beforeEach(async () => {
      await request(app.getHttpServer()).post('/auth/register').send(testUser);
    });

    it('should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should fail with wrong password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should fail with non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        })
        .expect(401);
    });
  });

  describe('/auth/me (GET)', () => {
    let accessToken: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser);
      accessToken = response.body.accessToken;
    });

    it('should return current user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        name: testUser.name,
        email: testUser.email,
      });
    });

    it('should fail without token', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('should fail with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
