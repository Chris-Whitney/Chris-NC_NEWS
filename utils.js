const db = require("../db/connection")
const format = require("pg-format")

const checkExists = async(articles, topic, value) => {
const queryStr = format("SELECT * FROM %I WHERE %I = $1;", articles, topic)

const dbOutput = await db.query(queryStr, [value]);

if(dbOutput.rows.length ===0) {
    return Promise.reject({ message: 'Status code 404: not found' });
}
}


module.exports = checkExists;