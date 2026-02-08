import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('CatalogController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

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

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser);
    accessToken = response.body.accessToken;
  });

  afterAll(async () => {
    await prisma.listItem.deleteMany();
    await prisma.listInvite.deleteMany();
    await prisma.listMember.deleteMany();
    await prisma.list.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('GET /catalog/suggest', () => {
    it('should return suggestions with at least one item (200)', async () => {
      const response = await request(app.getHttpServer())
        .get('/catalog/suggest')
        .query({ query: 'javascript' })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('suggestions');
      expect(Array.isArray(response.body.suggestions)).toBe(true);
      expect(response.body.suggestions.length).toBeGreaterThanOrEqual(1);
    }, 15000);

    it('should have first suggestion as OTHER type with the query as title', async () => {
      const query = 'javascript';

      const response = await request(app.getHttpServer())
        .get('/catalog/suggest')
        .query({ query })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const first = response.body.suggestions[0];
      expect(first.kind).toBe('OTHER');
      expect(first.title).toBe(query);
    }, 15000);

    it('should return empty suggestions for empty query (200)', async () => {
      const response = await request(app.getHttpServer())
        .get('/catalog/suggest')
        .query({ query: '' })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('suggestions');
      expect(response.body.suggestions).toHaveLength(0);
    });

    it('should fail without authentication (401)', async () => {
      await request(app.getHttpServer())
        .get('/catalog/suggest')
        .query({ query: 'javascript' })
        .expect(401);
    });
  });
});
