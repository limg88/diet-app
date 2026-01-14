import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Client } from 'pg';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://dietapp:dietapp@localhost:5433/dietapp';

async function resetDatabase() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    await client.query('DELETE FROM shopping_items');
    await client.query('DELETE FROM meal_items');
    await client.query('DELETE FROM menu_meals');
    await client.query('DELETE FROM weekly_menus');
    await client.query('DELETE FROM ingredients');
    await client.query('DELETE FROM users');
  } finally {
    await client.end();
  }
}

describe('Ingredients (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;
  let ingredientId: string;

  beforeAll(async () => {
    await resetDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' })
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })
      .expect(200);

    token = loginResponse.body.accessToken as string;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('creates an ingredient', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/ingredients')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Oats',
        category: 'Grains',
        defaultUnit: 'gr',
        defaultQuantity: 60,
        allowedMealTypes: ['BREAKFAST'],
      })
      .expect(201);

    ingredientId = response.body.id;
    expect(response.body.name).toBe('Oats');
    expect(response.body.defaultUnit).toBe('gr');
    expect(response.body.defaultQuantity).toBe(60);
  });

  it('lists ingredients with filters', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/ingredients?search=Oat&mealType=BREAKFAST')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.total).toBe(1);
    expect(response.body.items[0].name).toBe('Oats');
  });

  it('updates an ingredient', async () => {
    const response = await request(app.getHttpServer())
      .put(`/api/ingredients/${ingredientId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ category: 'Breakfast', defaultUnit: 'unit', defaultQuantity: 2 })
      .expect(200);

    expect(response.body.category).toBe('Breakfast');
    expect(response.body.defaultUnit).toBe('unit');
    expect(response.body.defaultQuantity).toBe(2);
  });

  it('lists all ingredients when pagination params are omitted', async () => {
    const creations: Array<Promise<request.Response>> = [];
    for (let i = 1; i <= 24; i += 1) {
      creations.push(
        request(app.getHttpServer())
          .post('/api/ingredients')
          .set('Authorization', `Bearer ${token}`)
          .send({
            name: `Seed ${i}`,
            category: 'Seed',
            defaultUnit: 'gr',
            defaultQuantity: 100,
            allowedMealTypes: [],
          })
          .expect(201),
      );
    }
    await Promise.all(creations);

    const response = await request(app.getHttpServer())
      .get('/api/ingredients')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.total).toBe(25);
    expect(response.body.items).toHaveLength(25);
  });

  it('soft deletes an ingredient', async () => {
    await request(app.getHttpServer())
      .delete(`/api/ingredients/${ingredientId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const listResponse = await request(app.getHttpServer())
      .get('/api/ingredients')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(listResponse.body.total).toBe(24);
    expect(listResponse.body.items).toHaveLength(24);

    const includeDeletedResponse = await request(app.getHttpServer())
      .get('/api/ingredients?includeDeleted=true')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(includeDeletedResponse.body.total).toBe(25);
    expect(includeDeletedResponse.body.items.some((item: { deletedAt: string | null }) => item.deletedAt)).toBe(
      true,
    );
  });
});
