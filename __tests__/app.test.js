const db = require('../db/connection.js');
const testData = require('../db/data/test-data/index.js');
const seed = require('../db/seeds/seed.js');
const app = require('../app');
const request = require("supertest");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe('/api/invalid_endpoint', () => {
    test('status:404 and returns an error message', () => {
        return request(app)
        .get('/api/invalid_endpoint')
        .expect(404)
        .then((res) => {
            expect(res.body.message).toBe('Invalid Endpoint!')
        })
    });
});

describe('/api/topics', () => {
    test('status 200: responds with an array of topic objects', () => {
        return request(app)
        .get('/api/topics')
        .expect(200)
        .then((res) => {
            expect(res.body.topics).toBeInstanceOf(Array);
            res.body.topics.forEach((topic) => {
                expect(topic).toMatchObject({
                    slug: expect.any(String),
                    description: expect.any(String)
                })
            })
        })
    });
});