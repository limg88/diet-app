import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Client } from 'pg';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { buildClientConfig } from '../src/database/db-config';

async function resetDatabase() {
  const client = new Client(buildClientConfig(process.env));
  await client.connect();
  try {
    await client.query('DELETE FROM meal_items');
    await client.query('DELETE FROM menu_meals');
    await client.query('DELETE FROM weekly_menus');
    await client.query('DELETE FROM shopping_items');
    await client.query('DELETE FROM ingredients');
    await client.query('DELETE FROM users');
  } finally {
    await client.end();
  }
}

describe('Shopping (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;
  let ingredientA: string;
  let ingredientB: string;
  let breakfastId: string;
  let lunchDay1Id: string;
  let dinnerDay1Id: string;
  let lunchDay2Id: string;

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
      .send({ email: 'shopping@example.com', password: 'password123' })
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'shopping@example.com', password: 'password123' })
      .expect(200);

    token = loginResponse.body.accessToken as string;

    const ingredientAResponse = await request(app.getHttpServer())
      .post('/api/ingredients')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Rice',
        category: 'Grains',
        defaultUnit: 'gr',
        defaultQuantity: 100,
      })
      .expect(201);

    ingredientA = ingredientAResponse.body.id as string;

    const ingredientBResponse = await request(app.getHttpServer())
      .post('/api/ingredients')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Milk',
        category: 'Dairy',
        defaultUnit: 'ml',
        defaultQuantity: 200,
        allowedMealTypes: ['BREAKFAST'],
      })
      .expect(201);

    ingredientB = ingredientBResponse.body.id as string;

    const menuResponse = await request(app.getHttpServer())
      .get('/api/menu/current')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const day1 = menuResponse.body.days[0];
    const day2 = menuResponse.body.days[1];
    breakfastId = day1.meals.find((meal: { mealType: string }) => meal.mealType === 'BREAKFAST')
      .id;
    lunchDay1Id = day1.meals.find((meal: { mealType: string }) => meal.mealType === 'LUNCH').id;
    dinnerDay1Id = day1.meals.find((meal: { mealType: string }) => meal.mealType === 'DINNER').id;
    lunchDay2Id = day2.meals.find((meal: { mealType: string }) => meal.mealType === 'LUNCH').id;

    await request(app.getHttpServer())
      .post(`/api/menu/current/meals/${breakfastId}/items`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ingredientId: ingredientB, quantity: 200, unit: 'ml' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/menu/current/meals/${lunchDay1Id}/items`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ingredientId: ingredientA, quantity: 100, unit: 'gr' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/menu/current/meals/${dinnerDay1Id}/items`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ingredientId: ingredientA, quantity: 50, unit: 'gr' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/menu/current/meals/${lunchDay2Id}/items`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ingredientId: ingredientA, quantity: 30, unit: 'gr' })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });

  it('aggregates menu items and persists purchased state', async () => {
    const listResponse = await request(app.getHttpServer())
      .get('/api/shopping/current')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const items = listResponse.body.items as Array<{ ingredientId: string; totalQuantity: number }>;
    const rice = items.find((item) => item.ingredientId === ingredientA);
    const milk = items.find((item) => item.ingredientId === ingredientB);

    expect(rice.totalQuantity).toBe(180);
    expect(milk.totalQuantity).toBe(200);

    const riceItem = listResponse.body.items.find(
      (item: { ingredientId: string }) => item.ingredientId === ingredientA,
    );

    await request(app.getHttpServer())
      .patch(`/api/shopping/current/items/${riceItem.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ purchased: true })
      .expect(200);

    const listAfter = await request(app.getHttpServer())
      .get('/api/shopping/current')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const riceAfter = listAfter.body.items.find(
      (item: { ingredientId: string }) => item.ingredientId === ingredientA,
    );
    expect(riceAfter.purchased).toBe(true);
  });

  it('filters by meal type', async () => {
    const listResponse = await request(app.getHttpServer())
      .get('/api/shopping/current?mealType=BREAKFAST')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const items = listResponse.body.items as Array<{ ingredientId: string }>;
    expect(items).toHaveLength(1);
    expect(items[0].ingredientId).toBe(ingredientB);
  });

  it('supports off-menu items', async () => {
    await request(app.getHttpServer())
      .post('/api/shopping/current/off-menu')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Water', unit: 'ml', quantity: 500 })
      .expect(201);

    const listResponse = await request(app.getHttpServer())
      .get('/api/shopping/current')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const offMenu = listResponse.body.items.find(
      (item: { source: string; name: string }) => item.source === 'OFF_MENU' && item.name === 'Water',
    );

    expect(offMenu).toBeTruthy();
  });
});
