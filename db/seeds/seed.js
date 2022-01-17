const db = require("../connection");
const allData = require("../data/test-data/index");

const seed = (data) => {
  const { articleData, commentData, topicData, userData } = data;

  return db.query(`DROP TABLE IF EXISTS comments`)
  .then(() => {
    return db.query(`DROP TABLE IF EXISTS articles`)
  })
  .then(() => {
    return db.query(`DROP TABLE IF EXISTS users`)
  })
  .then(() => {
    return db.query(`DROP TABLE IF EXISTS topics`)
  })
  .then(() => {
    return db.query(`CREATE TABLE topics (
      slug TEXT UNIQUE NOT NULL PRIMARY KEY,
      description VARCHAR(100)
    );`);
  })
  .then(() => {
    return db.query(`CREATE TABLE users (
      username TEXT UNIQUE NOT NULL PRIMARY KEY,
      avatar_url TEXT NOT NULL,
      name VARCHAR(50)
    );`)
  })
  .then(() => {
    return db.query(`CREATE TABLE articles (
      article_id SERIAL PRIMARY KEY,
      title VARCHAR(50) NOT NULL,
      body TEXT NOT NULL,
      votes INT NOT NULL,
      topic TEXT,
      FOREIGN KEY (topic) REFERENCES topics(slug),
      author TEXT,
      FOREIGN KEY (author) REFERENCES users(username),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`)
  })
  .then(() => {
    return db.query(`CREATE TABLE comments (
      comment_id SERIAL PRIMARY KEY,
      author TEXT,
      FOREIGN KEY (author) REFERENCES users(username),
      article_id INT,
      FOREIGN KEY (article_id) REFERENCES articles(article_id),
      votes INT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      body TEXT NOT NULL
    );`)
  })
  .then((result) => {
   console.log(result)
  })
  
};

module.exports = seed;


