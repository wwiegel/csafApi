const config = require("../../config");
const ElasticSearch = require('elasticsearch');

/**
 * *** ElasticSearch *** client
 * @type {Client}
 */
const conf = {
  host: `https://` + config.csafElasticsearch.host + ":" + config.csafElasticsearch.port
}
conf.httpAuth = config.csafElasticsearch.user + ":" + config.csafElasticsearch.password

const client = new ElasticSearch.Client(conf)

module.exports = client;