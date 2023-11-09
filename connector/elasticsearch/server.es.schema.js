const typeDefs = /* GraphQL */ `
  type MetadataCsafProvidersMetadataPublisher {
    category: String
    name: String
    namespace: String
  }
  
  type MetadataCsafProvidersMetadata {
    last_updated: String
    publisher: MetadataCsafProvidersMetadataPublisher
    role: String
    url: String
  }
  
  type MetadataCsafProviders {
    metadata: [MetadataCsafProvidersMetadata]
  }
  
  type MetadataAggregator {
    category: String
    contact_details: String
    issuing_authority: String
    name: String
    namespace: String
  }
  
  type Metadata {
	aggregator: MetadataAggregator
    aggregator_version: String
    canonical_url: String
    csaf_providers:  MetadataCsafProviders
    last_updated: String
}
  
  type queryMetadata {
    graphQl: Metadata
    base64CsafDocument: String
  }
  
  type csafDocumentDocument {
	  acknowledgments: String
	  aggregate_severity(text: String): String
	  category: String
	  csaf_version: String
	  distribution: String
	  lang: String
	  notes: String
	  publisher: String
	  references: String
	  source_lang: String
	  title: String
	  tracking: String
  }

  type csafDocumentProductTreeFullProductNames {
    name : String
    product_id : String
  }

  type csafDocumentProductTree {
    full_product_names: csafDocumentProductTreeFullProductNames
  }

  type csafDocumentVulnerabilities {
    cve : String
    title : String
  }

  type csafDocument {
    document(
		acknowledgments: String,
		aggregate_severity: String,
		category: String,
		csaf_version: String,
		lang: String,
		source_lang: String,
		title: String
	): csafDocumentDocument
    product_tree: csafDocumentProductTree
    vulnerabilities: [csafDocumentVulnerabilities] 
  }
  
  type queryCsafDocument {
    graphQl: [csafDocument]
    base64CsafDocument: String
  }


  type Documents {
    firstName: String
    lastName: String
  }

  # the schema allows the following query:
  type Query {
    document: String
    product_tree: [Documents]
    vulnerabilities: [Documents]
  }

  # this schema allows the following mutation:
  type Mutation {
    upvotePost(postId: ID!): Post
  }

  # we need to tell the server which types represent the root query
  # and root mutation types. We call them RootQuery and RootMutation by convention.
  schema {
    query: Query
    mutation: Mutation
  }
`

//export default typeDefs

