# csafApi
![csaf-api](https://github.com/wwiegel/csafApi/assets/147643099/ffedee6a-ba0c-4691-bf22-dfa46a4d5d22)

This is a GraphQL-based API with which CSAF documents can be retrieved from a database (e.g. Elasticsearch).
The CSAF API was developed as part of a master's thesis
(https://www.fernuni-hagen.de/pv/docs/wiegel-abschlussarbeit.pdf).

# Prerequisites:

This API assumes that an Elasticsearch database is already running and has an index that is filled with CSAF documents.
In addition, the following software packages are required to operate the API:
```
sudo apt install npm
npm install apollo-server
npm install graphql
npm install graphql-depth-limit
npm install fs
```

# Setup:

Clone API:            git clone https://github.com/wwiegel/csafApi.git

Change configuration (logging parts and connection strings) with `nano ./csafApi/config.js`:
                      
```
csafServer.logFile
csafIntermediate.logFile
csafElasticsearch.elasticsearchIndex
csafElasticsearch.host
csafElasticsearch.port
csafElasticsearch.user
csafElasticsearch.password
csafElasticsearch.logFile
```
