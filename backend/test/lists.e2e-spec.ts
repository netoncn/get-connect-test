import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('ListsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let userId: string;

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
    userId = response.body.user.id;
  });

  afterAll(async () => {
    await prisma.listItem.deleteMany();
    await prisma.listInvite.deleteMany();
    await prisma.listMember.deleteMany();
    await prisma.list.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('/lists (POST)', () => {
    it('should create a new list', async () => {
      const response = await request(app.getHttpServer())
        .post('/lists')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'My Reading List' })
        .expect(201);

      expect(response.body).toMatchObject({
        name: 'My Reading List',
        userRole: 'OWNER',
        itemCount: 0,
        memberCount: 1,
      });
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post('/lists')
        .send({ name: 'My List' })
        .expect(401);
    });
  });

  describe('/lists (GET)', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/lists')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'List 1' });

      await request(app.getHttpServer())
        .post('/lists')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'List 2' });
    });

    it('should return all user lists', async () => {
      const response = await request(app.getHttpServer())
        .get('/lists')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('userRole', 'OWNER');
    });
  });

  describe('/lists/:listId (GET)', () => {
    let listId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/lists')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Test List' });
      listId = response.body.id;
    });

    it('should return list details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/lists/${listId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        name: 'Test List',
        userRole: 'OWNER',
      });
      expect(response.body.members).toHaveLength(1);
    });

    it('should return 404 for non-existent list', async () => {
      await request(app.getHttpServer())
        .get('/lists/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('/lists/:listId (PATCH)', () => {
    let listId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/lists')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Original Name' });
      listId = response.body.id;
    });

    it('should update list name', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/lists/${listId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
    });
  });

  describe('/lists/:listId (DELETE)', () => {
    let listId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/lists')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'To Delete' });
      listId = response.body.id;
    });

    it('should delete list', async () => {
      await request(app.getHttpServer())
        .delete(`/lists/${listId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/lists/${listId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('/lists/:listId/items (POST)', () => {
    let listId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/lists')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Test List' });
      listId = response.body.id;
    });

    it('should add item to list', async () => {
      const response = await request(app.getHttpServer())
        .post(`/lists/${listId}/items`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          kind: 'OTHER',
          title: 'Test Item',
          notes: 'Some notes',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        kind: 'OTHER',
        title: 'Test Item',
        notes: 'Some notes',
        done: false,
      });
    });

    it('should add book item with metadata', async () => {
      const response = await request(app.getHttpServer())
        .post(`/lists/${listId}/items`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          kind: 'BOOK',
          title: 'The Great Gatsby',
          metadata: {
            authors: ['F. Scott Fitzgerald'],
            source: 'OPEN_LIBRARY',
          },
        })
        .expect(201);

      expect(response.body).toMatchObject({
        kind: 'BOOK',
        title: 'The Great Gatsby',
      });
      expect(response.body.metadata).toMatchObject({
        authors: ['F. Scott Fitzgerald'],
      });
    });
  });

  describe('RBAC permissions', () => {
    let listId: string;
    let viewerToken: string;

    beforeEach(async () => {
      const listResponse = await request(app.getHttpServer())
        .post('/lists')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Test List' });
      listId = listResponse.body.id;

      const viewerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Viewer',
          email: 'viewer@example.com',
          password: 'password123',
        });
      viewerToken = viewerResponse.body.accessToken;
    });

    it('should deny access to non-members', async () => {
      await request(app.getHttpServer())
        .get(`/lists/${listId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(403);
    });
  });
});
