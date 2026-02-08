import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('ItemsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let accessToken: string;
  let userId: string;
  let listId: string;

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

    const listRes = await request(app.getHttpServer())
      .post('/lists')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Test List' });
    listId = listRes.body.id;
  });

  afterAll(async () => {
    await prisma.listItem.deleteMany();
    await prisma.listInvite.deleteMany();
    await prisma.listMember.deleteMany();
    await prisma.list.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('POST /lists/:listId/items', () => {
    it('should add an OTHER item (201)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/lists/${listId}/items`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ kind: 'OTHER', title: 'Buy groceries' })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.listId).toBe(listId);
      expect(response.body.kind).toBe('OTHER');
      expect(response.body.title).toBe('Buy groceries');
      expect(response.body.done).toBe(false);
      expect(response.body.createdById).toBe(userId);
      expect(response.body.createdByName).toBe(testUser.name);
    });

    it('should add a BOOK item with metadata (201)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/lists/${listId}/items`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          kind: 'BOOK',
          title: 'The Great Gatsby',
          notes: 'Must read this summer',
          metadata: {
            authors: ['F. Scott Fitzgerald'],
            isbn: '9780743273565',
            coverUrl: 'https://example.com/cover.jpg',
          },
        })
        .expect(201);

      expect(response.body.kind).toBe('BOOK');
      expect(response.body.title).toBe('The Great Gatsby');
      expect(response.body.notes).toBe('Must read this summer');
      expect(response.body.metadata).toBeDefined();
      expect(response.body.metadata.authors).toContain('F. Scott Fitzgerald');
      expect(response.body.metadata.isbn).toBe('9780743273565');
    });

    it('should fail without authentication (401)', async () => {
      await request(app.getHttpServer())
        .post(`/lists/${listId}/items`)
        .send({ kind: 'OTHER', title: 'No auth item' })
        .expect(401);
    });

    it('should fail for VIEWER role (403)', async () => {
      const viewerUser = {
        name: 'Viewer User',
        email: 'viewer@example.com',
        password: 'password123',
      };

      const viewerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send(viewerUser);
      const viewerToken = viewerRes.body.accessToken;
      const viewerUserId = viewerRes.body.user.id;

      await prisma.listMember.create({
        data: {
          listId,
          userId: viewerUserId,
          role: 'VIEWER',
        },
      });

      await request(app.getHttpServer())
        .post(`/lists/${listId}/items`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ kind: 'OTHER', title: 'Viewer item' })
        .expect(403);
    });
  });

  describe('GET /lists/:listId/items', () => {
    it('should return all items (200)', async () => {
      await request(app.getHttpServer())
        .post(`/lists/${listId}/items`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ kind: 'OTHER', title: 'Item 1' });

      await request(app.getHttpServer())
        .post(`/lists/${listId}/items`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ kind: 'OTHER', title: 'Item 2' });

      const response = await request(app.getHttpServer())
        .get(`/lists/${listId}/items`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
    });

    it('should return empty array for new list (200)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/lists/${listId}/items`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('PATCH /lists/:listId/items/:itemId', () => {
    let itemId: string;

    beforeEach(async () => {
      const itemRes = await request(app.getHttpServer())
        .post(`/lists/${listId}/items`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ kind: 'OTHER', title: 'Original Title' });
      itemId = itemRes.body.id;
    });

    it('should update item title (200)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/lists/${listId}/items/${itemId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(response.body.title).toBe('Updated Title');
      expect(response.body.id).toBe(itemId);
    });

    it('should toggle item done status (200)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/lists/${listId}/items/${itemId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ done: true })
        .expect(200);

      expect(response.body.done).toBe(true);

      const response2 = await request(app.getHttpServer())
        .patch(`/lists/${listId}/items/${itemId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ done: false })
        .expect(200);

      expect(response2.body.done).toBe(false);
    });

    it('should return 404 for non-existent item', async () => {
      await request(app.getHttpServer())
        .patch(`/lists/${listId}/items/00000000-0000-0000-0000-000000000000`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Should not work' })
        .expect(404);
    });
  });

  describe('DELETE /lists/:listId/items/:itemId', () => {
    let itemId: string;

    beforeEach(async () => {
      const itemRes = await request(app.getHttpServer())
        .post(`/lists/${listId}/items`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ kind: 'OTHER', title: 'Item to delete' });
      itemId = itemRes.body.id;
    });

    it('should delete item (204)', async () => {
      await request(app.getHttpServer())
        .delete(`/lists/${listId}/items/${itemId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);
    });

    it('should return 404 for non-existent item', async () => {
      await request(app.getHttpServer())
        .delete(`/lists/${listId}/items/00000000-0000-0000-0000-000000000000`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should verify item is gone after delete (GET returns less items)', async () => {
      await request(app.getHttpServer())
        .post(`/lists/${listId}/items`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ kind: 'OTHER', title: 'Another item' });

      const beforeRes = await request(app.getHttpServer())
        .get(`/lists/${listId}/items`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(beforeRes.body).toHaveLength(2);

      await request(app.getHttpServer())
        .delete(`/lists/${listId}/items/${itemId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      const afterRes = await request(app.getHttpServer())
        .get(`/lists/${listId}/items`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(afterRes.body).toHaveLength(1);
      expect(afterRes.body[0].title).toBe('Another item');
    });
  });
});
