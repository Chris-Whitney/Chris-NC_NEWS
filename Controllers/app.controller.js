const { fetchTopics } = require('../Models/app.models');

exports.getTopics = (req, res) => {
    console.log('in the controller')
    fetchTopics();
    
}