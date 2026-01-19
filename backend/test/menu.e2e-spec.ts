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
    await client.query('DELETE FROM ingredients');
    await client.query('DELETE FROM users');
  } finally {
    await client.end();
  }
}

describe('Menu (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;
  let lunchMealId: string;
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
      .send({ email: 'menu@example.com', password: 'password123' })
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'menu@example.com', password: 'password123' })
      .expect(200);

    token = loginResponse.body.accessToken as string;

    const ingredientResponse = await request(app.getHttpServer())
      .post('/api/ingredients')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Chicken',
        category: 'Protein',
        defaultUnit: 'gr',
        defaultQuantity: 150,
        allowedMealTypes: ['LUNCH'],
      })
      .expect(201);

    ingredientId = ingredientResponse.body.id as string;
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates current menu with 7 days and 5 meals each', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/menu/current')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.days).toHaveLength(7);
    for (const day of response.body.days) {
      expect(day.meals).toHaveLength(5);
    }

    const dayOne = response.body.days[0];
    const lunchMeal = dayOne.meals.find((meal: { mealType: string }) => meal.mealType === 'LUNCH');
    lunchMealId = lunchMeal.id;
  });

  it('adds a meal item to current week menu', async () => {
    await request(app.getHttpServer())
      .post(`/api/menu/current/meals/${lunchMealId}/items`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ingredientId, quantity: 150, unit: 'gr' })
      .expect(201);
  });

  it('rejects ingredient not allowed for meal type', async () => {
    const otherIngredient = await request(app.getHttpServer())
      .post('/api/ingredients')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Stew',
        category: 'Dinner',
        defaultUnit: 'gr',
        defaultQuantity: 200,
        allowedMealTypes: ['DINNER'],
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/menu/current/meals/${lunchMealId}/items`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ingredientId: otherIngredient.body.id, quantity: 1, unit: 'unit' })
      .expect(400);
  });
});
