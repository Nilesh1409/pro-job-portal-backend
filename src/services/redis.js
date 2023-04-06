'use strict'

const redis = require('redis')
const config = require('../config')
const  Redisclient = redis.createClient(config.redisPort)

// // Redisclient.on('connect', function() {
//   console.log('Redis client connected');
// });

// // Redisclient.on("error", function (err) {
//   console.log(`Error in Redis client initialization ${err}`);
//   process.exit(-1)
// });

module.exports =  Redisclient

