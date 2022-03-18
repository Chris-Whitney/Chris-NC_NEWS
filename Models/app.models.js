const app = require("../app");
const db = require("../db/connection");

exports.fetchTopics = () => {
  return db.query(`SELECT * FROM topics`).then((topics) => {
    return topics.rows;
  });
};

exports.fetchArticleById = (id) => {
  return db
    .query(
      `SELECT articles.author, articles.title, articles.article_id, articles.body, articles.topic, articles.votes, articles.created_at,
    COUNT(comments.comment_id)::INT AS comment_count FROM articles 
    LEFT JOIN comments 
    ON articles.article_id = comments.article_id
    WHERE articles.article_id = $1 
    GROUP BY articles.article_id`,
      [id]
    )
    .then((result) => {
      const article = result.rows[0];
      if (!article) {
        return Promise.reject({
          status: 404,
          message: `No article found for article_id ${id}`,
        });
      }
      return article;
    });
};

exports.updateArticleById = (article_id, inc_votes) => {
  if (inc_votes === undefined) {
    return db
      .query(
        `SELECT * FROM articles
        WHERE article_id = $1`,
        [article_id]
      )
      .then((unalteredArticle) => {
        return unalteredArticle.rows[0];
      });
  }

  return db
    .query(
      `UPDATE articles
    SET votes = votes + $1
    WHERE article_id = $2 RETURNING*;`,
      [inc_votes, article_id]
    )
    .then((result) => {
      return result.rows[0];
    });
};

exports.fetchAllArticles = (
  sort_by = "created_at",
  order_by = "DESC",
  topic
) => {
  const topics = ["mitch", "cats", "paper"];
  let queryStr = `SELECT articles.author, articles.title, articles.article_id, articles.body, articles.topic, articles.created_at, articles.votes,COUNT(comments.body)::INT AS comment_count FROM articles 
        LEFT JOIN comments 
        ON articles.article_id = comments.article_id`;

  if (topic) {
    queryStr += ` WHERE topic = $1 GROUP BY articles.article_id ORDER BY ${sort_by} ${order_by}`;
    return db.query(queryStr, [topic]).then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          message: "Topic Not Found!",
        });
      }
      return result.rows;
    });
  } else {
    return db
      .query(
        `SELECT articles.author, articles.title, articles.article_id, articles.body, articles.topic, articles.created_at, articles.votes,COUNT(comments.body)::INT AS comment_count FROM articles 
        LEFT JOIN comments 
        ON articles.article_id = comments.article_id
        GROUP BY articles.article_id
        ORDER BY ${sort_by} ${order_by}`
      )
      .then((result) => {
        return result.rows;
      });
  }
};

exports.fetchCommentsByArticleId = (article_id) => {
  const ArticleQuant = [];

  return db
    .query(`SELECT articles.article_id FROM articles`)
    .then((result) => {
      ArticleQuant.push(result.rows.length);
    })
    .then(() => {
      return db.query(
        `SELECT comments.comment_id, comments.votes, comments.created_at, users.username AS author, comments.body FROM comments INNER JOIN articles ON comments.article_id = articles.article_id INNER JOIN users ON comments.author = users.username
    WHERE articles.article_id = $1`,
        [article_id]
      );
    })

    .then((result) => {
      if (parseInt(article_id) <= ArticleQuant[0]) {
        return Promise.resolve(result.rows);
      }

      if (parseInt(article_id) > ArticleQuant[0]) {
        return Promise.reject({
          status: 404,
          message: `No article found for article_id ${article_id}`,
        });
      }

      return result.rows;
    });
};

exports.postNewComment = (username, body, article_id) => {
  const users = ["butter_bridge", "icellusedkars", "rogersop", "lurker", 'cooljmessy', 'jessjelly', 'grumpy19', 'tickle122', 'happyamy2016', 'Anonymous', 'weegembump'];

  if (username && !users.includes(username)) {
    return Promise.reject({
      status: 404,
      message: `User not found!`,
    });
  }

  return db
    .query(
      `INSERT INTO comments
 (votes, author, body, article_id)
 VALUES (0, $1, $2, $3)
 RETURNING comment_id, votes, article_id, created_at, author, body
 `,
      [username, body, article_id]
    )
    .then((result) => {
      return result.rows[0];
    });
};

exports.deleteComment = (article_id, comment_id) => {
  return db
    .query(
      `SELECT * FROM comments
  WHERE comment_id = $1`,
      [comment_id]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          message: "Comment Not Found!",
        });
      }
      return db.query(
        `DELETE FROM comments
  WHERE comment_id = $1 RETURNING *`,
        [comment_id]
      );
    })
};

exports.fetchUsers = () => {
  return db.query(`SELECT username, avatar_url, name FROM users`).then((users) => {
    return users.rows;
  });
};
