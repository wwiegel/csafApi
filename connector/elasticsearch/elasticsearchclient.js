const config = require("../../config");
const elasticsearchIndex = config.csafElasticsearch.elasticsearchIndex;

const client = require('./elasticsearch_client');

/**
 * Ping the CLIENT to be sure 
 * *** ElasticSearch *** is up
 */
client.ping({
  requestTimeout: config.csafElasticsearch.requestTimeout,
}, function (error) {
  error
    ? console.error('ElasticSearch cluster is down!')
    : console.log('ElasticSearch is ok');
});

function ElasticSearchClient(body) {
	return client.search({index: elasticsearchIndex, body: body});
}

module.exports = {
  ElasticSearchClient
};