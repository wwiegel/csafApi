module.exports = {
	"size": 1000,
	"from": 0,
	"query": {
		"bool": {
			"must" : [ 
				{"match": { "vulnerabilities.cve.keyword": "CVE-2022-43975" }},
				{"bool" : 
					{
						"should" : [
							{
								"bool": {
									"must": [
										{ "range": { "vulnerabilities.scores.cvss_v2.baseScore": { "gte": 8.4, "lte":100.0 }}},
										{ "bool": 
											{ "must_not": 
												[
													{ "exists": { "field": "vulnerabilities.scores.cvss_v3.baseScore"}} 
												]
											}
										}
									]
								}
							},
							{
								"bool": {
									"must": [
										{ "range": { "vulnerabilities.scores.cvss_v3.baseScore": { "gte": 8.4, "lte":100.0 }}},
										{ "bool": 
											{ "must_not": 
												[
													{ "exists": { "field": "vulnerabilities.scores.cvss_v2.baseScore"}} 
												]
											}
										}
									]
								}
							}
						]
					}
				}
			]
		}
	}
};