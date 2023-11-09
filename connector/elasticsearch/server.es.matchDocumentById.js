module.exports = {
	"size": 1000,
	"from": 0,
	"query": {
		"bool": {
			"must" : [
				{
					"match": {
						"document.tracking.id.keyword": ""
					}
				},
				{
					"match": {
						"document.publisher.namespace.keyword": ""
					}
				}
			]
		}
	}
};