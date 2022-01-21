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
    test('status 200: returns an array of article objects sorted by a given query which defaults to sorted by created_at', () => {
        return request(app)
        .get('/api/articles?sort_by=votes')
        .expect(200)
        .then((res) => {
            expect(res.body.articles).toBeSortedBy('votes', { descending: true })
        })
    });
    test('status 200: returns an array of article objects ordered by a query', () => {
        return request(app)
        .get('/api/articles?order_by=ASC')
        .expect(200)
        .then((res) => {
            expect(res.body.articles).toBeSorted({ coerce: true })
        })
    });
    test('status 200: returns an array of articles filtered by a query', () => {
        return request(app)
        .get('/api/articles?topic=mitch')
        .expect(200)
        .then((res) => {
            expect(res.body.articles.length).toBe(11)
            expect(res.body.articles.every((article) => 
                article.topic === 'mitch'
            )).toBe(true)
        })
    });
    test('status 400: invalid sort query', () => {
        return request(app)
        .get('/api/articles?sort_by=not_a_valid_column')
        .expect(400)
        .then((res) => {
            expect(res.body.message).toBe('Bad Request')
        })
    });
    test('status 400: invalid order query', () => {
        return request(app)
        .get('/api/articles?order_by=not_a_valid_order')
        .expect(400)
        .then((res) => {
            expect(res.body.message).toBe('Bad Request')
        })
    });
    test('status 404: topic does not exist', () => {
        return request(app)
        .get('/api/articles?topic=not_a_valid_topic')
        .expect(404)
        .then((res) => {
            expect(res.body.message).toBe('Topic Not Found!')
        })
    });
});

describe('GET/api/articles/:article_id/comments', () => {
    test('status 200: returns an array of comments ', () => {
        return request(app)
        .get('/api/articles/1/comments')
        .expect(200)
        .then((res) => {
            expect(res.body.comments).toBeInstanceOf(Array)
            res.body.comments.forEach((comment) => {
                expect(comment)
                .toMatchObject({
                    comment_id: expect.any(Number),
                    votes: expect.any(Number),
                    created_at: expect.any(String),
                    author: expect.any(String),
                    body: expect.any(String)
                })
            })
        })
    });
    test('returns an empty array if article_id is valid but has no comments', () => {
        return request(app)
        .get('/api/articles/6/comments')
        .expect(200)
        .then((res) => {
            expect(res.body.comments).toBeInstanceOf(Array)
        })
    });
    test('status 400: Bad Request if invalid article id type is input', () => {
        return request(app)
        .get('/api/articles/not_a_valid_id_type/comments')
        .expect(400)
        .then((res => {
            expect(res.body.message).toBe('Bad Request')
        }))
    });
    test('status 404: Not Found if the article id does not exist', () => {
        return request(app)
        .get('/api/articles/123456/comments')
        .expect(404)
        .then((res => {
            expect(res.body.message).toBe('No article found for article_id 123456')
        }))
    });
});

describe('POST /api/articles/:article_id/comments', () => {
    test('status 201: returns a posted comment', () => {
        return request(app)
        .post('/api/articles/7/comments')
        .send({
            username: "lurker",
            body: "Yay first comment!" 
        })
        .expect(201)
        .then((res) => {
            expect(res.body.postedComment).toMatchObject({
                comment_id: expect.any(Number),
                votes: expect.any(Number),
                created_at: expect.any(String),
                author: expect.any(String),
                body: expect.any(String)
            })
        })
    });
    test('status 400: Bad Request if invalid article id type is input', () => {
        return request(app)
        .post('/api/articles/not_a_valid_id_type/comments')
        .send({
            username: "lurker",
            body: "Yay first comment!" 
        })
        .expect(400)
        .then((res => {
            expect(res.body.message).toBe('Bad Request')
        }))
    });
    });
    test('status 400: missing required fields', () => {
        return request(app)
        .post('/api/articles/1/comments')
        .send({})
        .expect(400)
        .then((res => {
            expect(res.body.message).toBe('Bad Request')
        }))
    });
    test('status 400: failing schema validation', () => {
        return request(app)
        .post('/api/articles/1/comments')
        .send({ 
            user: "lurker", 
            text: "hey thereeee!"
        })
        .expect(400)
        .then((res => {
            expect(res.body.message).toBe('Bad Request')
        }))
    });
    test('status 404: Not Found if the article id does not exist', () => {
        return request(app)
        .post('/api/articles/123456/comments')
        .send({
            username: "lurker",
            body: "Yay first comment!" 
        })
        .expect(404)
        .then((res => {
            expect(res.body.message).toBe('No article found')
        }))
});