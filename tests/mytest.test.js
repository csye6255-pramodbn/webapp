//Import Packages
const req = require('supertest');
const app = require('../index');

let app_Server;

beforeAll(() => {
  app_Server = app.listen();
});

afterAll((done) => {
  app_Server.close(done);
});

//Unit test cases
describe('HealthCheck Application', () => {
  it('Test should return 200 OK for GET request', async () => {
    const res = await req(app).get('/healthz');
    expect(res.statusCode).toEqual(200);
  });

  /*it('Test should return 405 for unsupported methods', async () => {
    const methods = ['post', 'put', 'delete', 'patch'];
    for (const method of methods) {
      const res = await req(app)[method]('/healthz');
      expect(res.statusCode).toEqual(405);
    }
  });*/
});
