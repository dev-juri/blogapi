import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { dropDatabase } from 'test/helpers/drop-database.helper';
import { bootstrapNestApplication } from 'test/helpers/bootstrap-nest-application.helper';
import { App } from 'supertest/types';
import * as request from 'supertest';
import {
  completeUser,
  missingEmail,
  missingFirstName,
  missingPassword,
} from './users.post.e2e-spec.sample-data';

describe('[Users] @Post Endpoint', () => {
  let app: INestApplication;
  let config: ConfigService;
  let httpServer: App;

  beforeEach(async () => {
    app = await bootstrapNestApplication();
    config = app.get<ConfigService>(ConfigService);
    httpServer = app.getHttpServer();
  });

  it('/users - Endpoint is public', async () => {
    return request(httpServer).post('/users').send({}).expect(400);
    // .then(({ body }) => {
    //   console.log(body);
    // });
  });

  it('/users - firstName is mandatory', async () => {
    return request(httpServer)
      .post('/users')
      .send(missingFirstName)
      .expect(400);
  });

  it('/users - password is mandatory', async () => {
    return request(httpServer).post('/users').send(missingPassword).expect(400);
  });

  it('/users - email is mandatory', async () => {
    return request(httpServer).post('/users').send(missingEmail).expect(400);
  });

  it('/users - valid request successfully creates a user', async () => {
    return request(httpServer)
      .post('/users')
      .send(completeUser)
      .expect(201)
      .then(({ body }) => {
        expect(body.data).toBeDefined();
        expect(body.data.firstName).toBe(completeUser.firstName);
        expect(body.data.lastName).toBe(completeUser.lastName);
        expect(body.data.email).toBe(completeUser.email);
      });
  });

  it('/users - pssword is not returned in response', async () => {
    return request(httpServer)
      .post('/users')
      .send(completeUser)
      .expect(201)
      .then(({ body }) => {
        expect(body.data).toBeDefined();
        expect(body.data.password).toBeUndefined();
      });
  });

  it('/users - googleId is not returned in response', async () => {
    return request(httpServer)
      .post('/users')
      .send(completeUser)
      .expect(201)
      .then(({ body }) => {
        expect(body.data).toBeDefined();
        expect(body.data.googleId).toBeUndefined();
      });
  });

  afterEach(async () => {
    await dropDatabase(config);
    await app.close();
  });
});
