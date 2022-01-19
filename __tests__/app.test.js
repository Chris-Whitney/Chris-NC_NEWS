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

describe('/api/articles/:article_id', () => {
    test('status 200: responds with a specific article object', () => {
        return request(app)
        .get('/api/articles/1')
        .expect(200)
        .then((res) => {
            expect(res.body.article).toEqual({
                author: 'butter_bridge',
                title: 'Living in the shadow of a great man',
                article_id: 1,
                body: 'I find this existence challenging',
                topic: 'mitch',
                votes: 100,
                created_at: '2020-07-09T20:11:00.000Z',
                comment_count: 11
              })
        })
    });
    test('status 400: bad request', () => {
        return request(app)
        .get('/api/articles/not_an_id')
        .expect(400)
        .then((res) => {
            expect(res.body.message).toBe('Bad Request')
        })
    });
    test('status 404: not found', () => {
        return request(app)
        .get('/api/articles/999999')
        .expect(404)
        .then((res) => {
            expect(res.body.message).toBe('No article found for article_id 999999')
        })
    });
});

describe('/api/articles/:article_id', () => {
    test('status 201: responds updated article', () => {
        return request(app)
        .patch('/api/articles/1')
        .send({
            inc_votes: -100
        })
        .expect(201)
        .then((res) => {
            expect(res.body.updatedArticle).toEqual({
                article_id: 1,
                title: 'Living in the shadow of a great man',
                body: 'I find this existence challenging',
                votes: 0,
                topic: 'mitch',
                author: 'butter_bridge',
                created_at: '2020-07-09T20:11:00.000Z'
            })
        }) 
    });
    test('status 400: malformed body/missing required fields', () => {
        return request(app)
        .patch('/api/articles/1')
        .send({})
        .expect(400)
        .then((res) => {
            expect(res.body.message).toBe('Bad Request')
        })
        
    });
    test('status 400: incorrect input type ', () => {
        return request(app)
        .patch('/api/articles/1')
        .send({ inc_votes: 'not_a_number' })
        .expect(400)
        .then((res) => {
            expect(res.body.message).toBe('Bad Request')
        })
        
    });
});

describe('GET/api/articles', () => {
    test('status 200: returns an array of articles', () => {
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then((res) => {
            expect(res.body.articles).toBeInstanceOf(Array)
            res.body.articles.forEach((article) => {
                expect(article).toMatchObject({
                    author: expect.any(String),
                    title: expect.any(String),
                    article_id: expect.any(Number),
                    body: expect.any(String),
                    topic: expect.any(String),
                    created_at: expect.any(String),
                    votes: expect.any(Number),
                    comment_count: expect.any(Number)
                })
            })
        })
    });
    test.only('returns an array of objects sorted by a given query', () => {
        return request(app)
        .get('/api/articles?sort_by=votes')
        .expect(200)
        .then((res) => {
            expect(res.body.articles).toBeSortedBy('votes')
        })
    });
});