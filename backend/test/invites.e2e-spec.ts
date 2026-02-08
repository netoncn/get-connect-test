import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('InvitesController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let ownerToken: string;
  let ownerUserId: string;
  let invitedToken: string;
  let invitedUserId: string;
  let listId: string;

  const ownerUser = {
    name: 'Owner User',
    email: 'owner@example.com',
    password: 'password123',
  };

  const invitedUser = {
    name: 'Invited User',
    email: 'invited@example.com',
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

    const ownerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send(ownerUser);
    ownerToken = ownerRes.body.accessToken;
    ownerUserId = ownerRes.body.user.id;

    const invitedRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send(invitedUser);
    invitedToken = invitedRes.body.accessToken;
    invitedUserId = invitedRes.body.user.id;

    const listRes = await request(app.getHttpServer())
      .post('/lists')
      .set('Authorization', `Bearer ${ownerToken}`)
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

  describe('POST /lists/:listId/invites', () => {
    it('should create invite for invited user email (201)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/lists/${listId}/invites`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ email: invitedUser.email, role: 'VIEWER' })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.listId).toBe(listId);
      expect(response.body.email).toBe(invitedUser.email);
      expect(response.body.role).toBe('VIEWER');
    });

    it('should fail when user is already a member (409)', async () => {
      await request(app.getHttpServer())
        .post(`/lists/${listId}/invites`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ email: invitedUser.email });

      const invite = await prisma.listInvite.findFirst({
        where: { listId, email: invitedUser.email },
      });

      await request(app.getHttpServer())
        .post(`/invites/${invite.token}/accept`)
        .set('Authorization', `Bearer ${invitedToken}`);

      await request(app.getHttpServer())
        .post(`/lists/${listId}/invites`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ email: invitedUser.email })
        .expect(409);
    });

    it('should fail for non-owner (403)', async () => {
      await request(app.getHttpServer())
        .post(`/lists/${listId}/invites`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ email: invitedUser.email, role: 'VIEWER' });

      const invite = await prisma.listInvite.findFirst({
        where: { listId, email: invitedUser.email },
      });

      await request(app.getHttpServer())
        .post(`/invites/${invite.token}/accept`)
        .set('Authorization', `Bearer ${invitedToken}`);

      await request(app.getHttpServer())
        .post(`/lists/${listId}/invites`)
        .set('Authorization', `Bearer ${invitedToken}`)
        .send({ email: 'another@example.com' })
        .expect(403);
    });
  });

  describe('GET /lists/:listId/invites', () => {
    it('should return pending invites for owner (200)', async () => {
      await request(app.getHttpServer())
        .post(`/lists/${listId}/invites`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ email: invitedUser.email });

      const response = await request(app.getHttpServer())
        .get(`/lists/${listId}/invites`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].email).toBe(invitedUser.email);
    });
  });

  describe('DELETE /lists/:listId/invites/:inviteId', () => {
    it('should cancel an invite (204)', async () => {
      const createRes = await request(app.getHttpServer())
        .post(`/lists/${listId}/invites`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ email: invitedUser.email });

      const inviteId = createRes.body.id;

      await request(app.getHttpServer())
        .delete(`/lists/${listId}/invites/${inviteId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(204);

      const invitesRes = await request(app.getHttpServer())
        .get(`/lists/${listId}/invites`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(invitesRes.body).toHaveLength(0);
    });

    it('should return 404 for non-existent invite', async () => {
      await request(app.getHttpServer())
        .delete(`/lists/${listId}/invites/00000000-0000-0000-0000-000000000000`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(404);
    });
  });

  describe('POST /invites/:token/accept', () => {
    it('should accept invite and add user as member (201)', async () => {
      await request(app.getHttpServer())
        .post(`/lists/${listId}/invites`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ email: invitedUser.email, role: 'VIEWER' });

      const invite = await prisma.listInvite.findFirst({
        where: { listId, email: invitedUser.email },
      });

      const response = await request(app.getHttpServer())
        .post(`/invites/${invite.token}/accept`)
        .set('Authorization', `Bearer ${invitedToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body.listId).toBe(listId);
      expect(response.body.listName).toBe('Test List');
    });

    it('should fail for already accepted invite (400)', async () => {
      await request(app.getHttpServer())
        .post(`/lists/${listId}/invites`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ email: invitedUser.email });

      const invite = await prisma.listInvite.findFirst({
        where: { listId, email: invitedUser.email },
      });

      await request(app.getHttpServer())
        .post(`/invites/${invite.token}/accept`)
        .set('Authorization', `Bearer ${invitedToken}`)
        .expect(201);

      await request(app.getHttpServer())
        .post(`/invites/${invite.token}/accept`)
        .set('Authorization', `Bearer ${invitedToken}`)
        .expect(400);
    });

    it('should fail for non-existent token (404)', async () => {
      await request(app.getHttpServer())
        .post('/invites/non-existent-token/accept')
        .set('Authorization', `Bearer ${invitedToken}`)
        .expect(404);
    });
  });

  describe('GET /lists/:listId/members', () => {
    it('should return members after invite accepted (200)', async () => {
      await request(app.getHttpServer())
        .post(`/lists/${listId}/invites`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ email: invitedUser.email, role: 'VIEWER' });

      const invite = await prisma.listInvite.findFirst({
        where: { listId, email: invitedUser.email },
      });

      await request(app.getHttpServer())
        .post(`/invites/${invite.token}/accept`)
        .set('Authorization', `Bearer ${invitedToken}`);

      const response = await request(app.getHttpServer())
        .get(`/lists/${listId}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);

      const roles = response.body.map((m: any) => m.role);
      expect(roles).toContain('OWNER');
      expect(roles).toContain('VIEWER');
    });
  });

  describe('PATCH /lists/:listId/members/:userId', () => {
    it('should update member role from VIEWER to EDITOR (200)', async () => {
      await request(app.getHttpServer())
        .post(`/lists/${listId}/invites`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ email: invitedUser.email, role: 'VIEWER' });

      const invite = await prisma.listInvite.findFirst({
        where: { listId, email: invitedUser.email },
      });

      await request(app.getHttpServer())
        .post(`/invites/${invite.token}/accept`)
        .set('Authorization', `Bearer ${invitedToken}`);

      const response = await request(app.getHttpServer())
        .patch(`/lists/${listId}/members/${invitedUserId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ role: 'EDITOR' })
        .expect(200);

      expect(response.body.role).toBe('EDITOR');
      expect(response.body.userId).toBe(invitedUserId);
    });

    it('should fail when trying to change owner role (403)', async () => {
      await request(app.getHttpServer())
        .patch(`/lists/${listId}/members/${ownerUserId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ role: 'EDITOR' })
        .expect(403);
    });
  });

  describe('DELETE /lists/:listId/members/:userId', () => {
    it('should remove member (204)', async () => {
      await request(app.getHttpServer())
        .post(`/lists/${listId}/invites`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ email: invitedUser.email, role: 'VIEWER' });

      const invite = await prisma.listInvite.findFirst({
        where: { listId, email: invitedUser.email },
      });

      await request(app.getHttpServer())
        .post(`/invites/${invite.token}/accept`)
        .set('Authorization', `Bearer ${invitedToken}`);

      await request(app.getHttpServer())
        .delete(`/lists/${listId}/members/${invitedUserId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(204);

      const membersRes = await request(app.getHttpServer())
        .get(`/lists/${listId}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(membersRes.body).toHaveLength(1);
      expect(membersRes.body[0].role).toBe('OWNER');
    });

    it('should fail when trying to remove owner (403)', async () => {
      await request(app.getHttpServer())
        .delete(`/lists/${listId}/members/${ownerUserId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(403);
    });
  });
});
