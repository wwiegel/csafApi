/**
 * On the following site, it is easy to transform the json files to the type 
 * definition of GraphQL:
 * https://transform.tools/json-to-graphql
 * 
 * The following JSON definitions were transformed to GraphQL
 * ../csaf_distribution/csaf/schema/csaf_json_schema.json
 * ../csaf_distribution/csaf/schema/cvss-v2.0.json
 * ../csaf_distribution/csaf/schema/cvss-v3.0.json
 * ../csaf_distribution/csaf/schema/cvss-v3.1.json
 * 
 * To every String type were the search arguments (exact and should) added,
 * here is an example for name from type String, with added search arguments:
 *   name(
 *     exact: String
 *     should: String
 *   ): String
 * 
 * To every String type (in the meaning of date) were additional search 
 * arguments (younger and older) added, here is an example for the initial 
 * release date, with additional added search arguments
 *   initial_release_date(
 *     exact: String
 *     should: String
 *     younger: String
 *     older: String
 *   ): String
 */

const { gql } = require("apollo-server");

const typeDefs = gql`
type Query {
    csafApi(
        max_documents: Int
        originals: Boolean 
        metadata: Boolean
    ): csafApiPlatypus
}

type csafApiPlatypus {
    findDocuments: csafApiPlatypusSearchCriteria
    filterParameter: csafApiPlatypusFilterCriteria
    documents: [csafDocument]
    originalDocuments: [csafOriginalDocuments]
    metadata: csafResultsMetadata
    error: String
}
type csafResultsMetadata {
    total: Int
}

type csafOriginalDocuments {
    documentName: String
    documentBase64Binary: String
}

type csafApiPlatypusSearchCriteria {
    csafAnd: csafApiMust
    csafOr: csafApiShould
    csafNot: csafApiMustNot
    csafXor: csafApiXor
    must: csafApiMust
    must_not: csafApiMustNot
    should: csafApiShould
    byProduct: full_product_name_t
    document: csafDocumentDocument
    product_tree: csafDocumentProductTree
    vulnerabilities: [csafDocumentVulnerabilities]
}

type csafApiXor {
    must: csafApiMust
    must_not: csafApiMustNot
    should: csafApiShould
    #device: csafDocument
    document: csafDocumentDocument
    product_tree: csafDocumentProductTree
    vulnerabilities: [csafDocumentVulnerabilities]
    exist: csafDocument
    existp(
        path: [String]
    ): String
    byProduct: full_product_name_t
}

type csafApiPlatypusSpecialFilter {
    relations: [csafApiPlatypusSpecialFilterRelation]
}

type csafApiPlatypusSpecialFilterRelation {
    left (
        path: String!
    ): String!
    right (
        path: String!
    ): String!
}

type csafApiPlatypusExtendedFilter {
    filterVulnerabilitiesProductStatusOnProductTreeFullProductNamesProductId: Boolean
}

type csafApiPlatypusFilterCriteria {
    must: csafDocument
    must_not: csafDocument
}

type csafApiMust {
    must: csafApiMust
    must_not: csafApiMustNot
    should: csafApiShould
    #device: csafDocument
    document: csafDocumentDocument
    product_tree: csafDocumentProductTree
    vulnerabilities: [csafDocumentVulnerabilities]
    exist: csafDocument
    existp(
        path: [String]
    ): String
    byProduct: full_product_name_t
}

type csafApiMustNot {
    must: csafApiMust
    must_not: csafApiMustNot
    should: csafApiShould
    #device: csafDocument
    document: csafDocumentDocument
    product_tree: csafDocumentProductTree
    vulnerabilities: [csafDocumentVulnerabilities]
    exist: csafDocument
    existp(
        path: [String]
    ): String
    byProduct: full_product_name_t
}

type csafApiShould {
    must: csafApiMust
    must_not: csafApiMustNot
    should: csafApiShould
    document: csafDocumentDocument
    product_tree: csafDocumentProductTree
    vulnerabilities: [csafDocumentVulnerabilities]
    exist: csafDocument
    existp(
        path: [String]
    ): String
    byProduct: full_product_name_t
}

type queryROLIE {
    feed: queryROLIEfeed
}

type queryROLIEfeed {
    id: String
    title: String
    link: [link_t]
    category: queryROLIEfeedCategory
    updated: String
    entry: [queryROLIEfeedEntry]
}

type queryROLIEfeedEntry {
    id: String
    title: String
    link: [link_t]
    published: String
    updated: String
    summary: queryROLIEfeedEntrySummary
    content: queryROLIEfeedEntryContent
    format: queryROLIEfeedEntryFormat
}

type queryROLIEfeedEntryFormat {
    schema: String
    version: String
}

type queryROLIEfeedEntryContent {
    src: String
    type: String
}

type queryROLIEfeedEntrySummary {
    content: String
}

type queryROLIEfeedCategory {
    scheme: String
    term: String
}

type link_t {
    href: String
    rel: String
}

type acknowledgments_t {
    names(
        exact: String
        should: String): [String]
    organization(
        exact: String
        should: String): String
    summary(
        exact: String
        should: String): String
    urls(
        exact: String
        should: String): [String]
}

enum csafDocumentDocumentCsafVersionEnum {
	V2_0
}

enum notes_tCategoryEnum {
	DESCRIPTION
	DETAILS
	FAQ
	GENERAL
	LEGAL_DISCLAIMER
	OTHER
	SUMMARY
}

type notes_t {
    audience(
        exact: String
        should: String): String
    category(
        enum: notes_tCategoryEnum): String
    text(
        exact: String
        should: String): String
    title(
        exact: String
        should: String): String
}

enum references_tCategoryEnum {
    EXTERNAL
    SELF
}

type references_t {
    category(
        enum: references_tCategoryEnum): String
    summary(
        exact: String
        should: String): String
    url(
        exact: String
        should: String): String
}

enum branches_tCategoryEnum {
    ARCHITECTURE
    HOST_NAME
    LANGUAGE
    LEGACY
    PATCH_LEVEL
    PRODUCT_FAMILY
    PRODUCT_NAME
    PRODUCT_VERSION
    PRODUCT_VERSION_RANGE
    SERVICE_PACK
    SPECIFICATION
}

type branches_t {
    branches: [branches_t]
    category(
        enum: branches_tCategoryEnum): String
    name(
        exact: String
        should: String): String
    product: full_product_name_t
}

type full_product_name_t_old {
    name(
        exact: String
        should: String): String
    product_id(
        exact: String
        should: String
        idInStatus_first_affected: Boolean
        idInStatus_first_fixed: Boolean
        idInStatus_fixed: Boolean
        idInStatus_known_affected: Boolean
        idInStatus_known_not_affected: Boolean
        idInStatus_last_affected: Boolean
        idInStatus_recommended: Boolean
        idInStatus_under_investigation: Boolean
        ): String
    product_identification_helper: full_product_name_tProductIdentificationHelper
}
type full_product_name_t {
    name(
    exact: String
    should: String): String
    product_id(
    exact: String
    should: String
    idInProductTreeProductGroupsProductIds: Boolean
    idInProductTreeRelationshipsProductReference: Boolean
    idInProductTreeRelationshipsRelatesToProductReference: Boolean
    idInVulnerabilitiesProductStatusFirstAffected: Boolean
    idInVulnerabilitiesProductStatusFirstFixed: Boolean
    idInVulnerabilitiesProductStatusFixed: Boolean
    idInVulnerabilitiesProductStatusKnownAffected: Boolean
    idInVulnerabilitiesProductStatusKnownNotAffected: Boolean
    idInVulnerabilitiesProductStatusLastAffected: Boolean
    idInVulnerabilitiesProductStatusRecommended: Boolean
    idInVulnerabilitiesProductStatusUnderInvestigation: Boolean
    idInVulnerabilitiesFlagsProductIds: Boolean
    idInVulnerabilitiesRemediationsProductIds: Boolean
    idInVulnerabilitiesScoresProducts: Boolean
    idInVulnerabilitiesThreatsProductIds: Boolean
    ): String
    product_identification_helper:
    full_product_name_tProductIdentificationHelper
}

type full_product_name_tProductIdentificationHelper {
    cpe(
        exact: String
        should: String): String
    hashes(
        exact: String
        should: String): String
    model_numbers(
        exact: String
        should: String): [String]
    purl(
        exact: String
        should: String): String
    sbom_urls(
        exact: String
        should: String): [String]
    serial_numbers(
        exact: String
        should: String): [String]
    skus(
        exact: String
        should: String): [String]
    x_generic_uris: [full_product_name_tProductIdentificationHelperXGenericUris]
}

type full_product_name_tProductIdentificationHelperXGenericUris {
    namespace(
        exact: String
        should: String): String
    uri(
        exact: String
        should: String): String
}

type Metadata {
    aggregator: MetadataAggregator
    aggregator_version(
        exact: String): String
    canonical_url(
        exact: String): String
    csaf_providers: [MetadataCsafProviders]
    csaf_publishers: [MetadataCsafPublishers]
    last_updated(
        exact: String
        younger: String
        older: String): String
}

type MetadataAggregator {
    category(
        exact: String
        should: String): String
    contact_details(
        exact: String
        should: String): String
    issuing_authority(
        exact: String
        should: String): String
    name(
        exact: String
        should: String): String
    namespace(
        exact: String
        should: String): String
}

type MetadataCsafProviders {
    metadata(
        exact: String
        should: String): String
    mirrors(
        exact: String
        should: String): String
}

type MetadataCsafPublishers {
    metadata(
        exact: String
        should: String): String
    mirrors(
        exact: String
        should: String): String
    update_interval(
        exact: String
        should: String): String
}

type csafDocument {
    document: csafDocumentDocument
    product_tree: csafDocumentProductTree
    vulnerabilities: [csafDocumentVulnerabilities]
}

type csafDocumentDocument {
    acknowledgments: [acknowledgments_t]
    aggregate_severity: csafDocumentDocumentAggregateSeverity
    category(
        exact: String
        should: String): String
    csaf_version(
        enum: csafDocumentDocumentCsafVersionEnum): String
    distribution: csafDocumentDocumentDistribution
    lang(
        exact: String
        should: String): String
    notes(
        audience: String
        category: String
        text: String
        title: String): [notes_t]
    publisher: csafDocumentDocumentPublisher
    references: [references_t]
    source_lang(
        exact: String
        should: String): String
    title(
        exact: String
        should: String): String
    tracking(id: String): csafDocumentDocumentTracking
}

type csafDocumentDocumentAggregateSeverity {
    namespace(
        exact: String
        should: String): String
    text(
        exact: String
        should: String): String
}

type csafDocumentDocumentDistribution {
    text(
        exact: String
        should: String): String
    tlp: csafDocumentDocumentDistributionTlp
}

enum csafDocumentDocumentDistributionTlpEnum{
	AMBER
	GREEN
	RED
	WHITE
}

type csafDocumentDocumentDistributionTlp {
    label(
        enum: csafDocumentDocumentDistributionTlpEnum): csafDocumentDocumentDistributionTlpEnum
    url(
        exact: String
        should: String): String
}

enum csafDocumentDocumentPublisherCategoryEnum{
	COORDINATOR
    DISCOVERER
    OTHER
    TRANSLATOR
    USER
    VENDOR
}

type csafDocumentDocumentPublisher {
    category(
        enum: csafDocumentDocumentPublisherCategoryEnum): String
    contact_details(
        exact: String
        should: String): String
    issuing_authority(
        exact: String
        should: String): String
    name(
        exact: String
        should: String): String
    namespace(
        exact: String
        should: String): String
}

enum csafDocumentDocumentTrackingStatusEnum{
	DRAFT
	FINAL
	INTERIM
}

type csafDocumentDocumentTracking {
    aliases(
        exact: String
        should: String): [String]
    current_release_date(
        exact: String
        should: String
        younger: String
        older: String): String
    generator: csafDocumentDocumentTrackingGenerator
    id(
        exact: String
        should: String): String
    initial_release_date(
        exact: String
        should: String
        younger: String
        older: String): String
    revision_history: [csafDocumentDocumentTrackingRevisionHistory]
    status(
        enum: csafDocumentDocumentTrackingStatusEnum): String
    version(
        exact: String
        should: String): String
}

type csafDocumentDocumentTrackingGenerator {
    date(
        exact: String
        should: String
        younger: String
        older: String): String
    engine: csafDocumentDocumentTrackingGeneratorEngine
}

type csafDocumentDocumentTrackingGeneratorEngine {
    name(
        exact: String
        should: String): String
    version(
        exact: String
        should: String): String
}

type csafDocumentDocumentTrackingRevisionHistory {
    date(
        exact: String
        should: String
        younger: String
        older: String): String
    legacy_version(
        exact: String
        should: String): String
    number(
        exact: String
        should: String): String
    summary(
        exact: String
        should: String): String
}

type csafDocumentProductTree {
    branches: [branches_t]
    full_product_names: [full_product_name_t]
    product_groups: [csafDocumentProductTreeProductGroups]
    relationships: [csafDocumentProductTreeRelationships]
}

type csafDocumentProductTreeProductGroups {
    group_id(
        exact: String
        should: String): String
    product_ids(
        exact: String
        should: String): [String]
    summary(
        exact: String
        should: String): String
}

enum csafDocumentProductTreeRelationshipsCategoryEnum{
	DEFAULT_COMPONENT_OF
	EXTERNAL_COMPONENT_OF
	INSTALLED_ON
    INSTALLED_WITH
    OPTIONAL_COMPONENT_OF
}

type csafDocumentProductTreeRelationships {
    category(
        exact: String
        should: String): String
    full_product_names: [full_product_name_t]
    product_reference(
        exact: String
        should: String): String
    relates_to_product_reference(
        exact: String
        should: String): String
}

type csafDocumentVulnerabilities {
    acknowledgments: [acknowledgments_t]
    cve(
        exact: String
        should: String): String
    cwe: csafDocumentVulnerabilitiesCwe
    discovery_date(
        exact: String
        should: String
        younger: String
        older: String): String
    flags: [csafDocumentVulnerabilitiesFlags]
    ids: [csafDocumentVulnerabilitiesIds]
    involvements: [csafDocumentVulnerabilitiesInvolvements]
    notes: [notes_t]
    product_status: csafDocumentVulnerabilitiesProductStatus
    references: [references_t]
    release_date(
        exact: String
        younger: String
        older: String): String
    remediations: [csafDocumentVulnerabilitiesRemediations]
    scores: [csafDocumentVulnerabilitiesScores]
    threats: [csafDocumentVulnerabilitiesThreats]
    title(
        exact: String
        should: String): String
}

type csafDocumentVulnerabilitiesCwe {
    id(
        exact: String
        should: String): String
    name(
        exact: String
        should: String): String
}

type csafDocumentVulnerabilitiesIds {
    system_name(
        exact: String
        should: String): String
    text(
        exact: String
        should: String): String
}

enum csafDocumentVulnerabilitiesFlagsLabelEnum{
	COMPONENT_NOT_PRESENT
	INLINE_MITIGATION_ALREADY_EXIST
	VULNERABLE_CODE_CANNOT_BE_CONTROLLED_BY_ADVERSARY
    VULNERABLE_CODE_NOT_IN_EXECUTE_PATH
    VULNERABLE_CODE_NOT_PRESENT
}

type csafDocumentVulnerabilitiesFlags {
    date(
        exact: String
        should: String
        younger: String
        older: String): String
    group_ids(
        exact: String
        should: String): [String]
    label(
        enum: csafDocumentVulnerabilitiesFlagsLabelEnum): String
    product_ids(
        exact: String
        should: String): [String]
}

type csafDocumentVulnerabilitiesIds {
    system_name(
        exact: String
        should: String): String
    text(
        exact: String
        should: String): String
}

enum csafDocumentVulnerabilitiesInvolvementsPartyEnum {
    COORDINATOR
    DISCOVERER
    OTHER
    USER
    VENDOR
}

enum csafDocumentVulnerabilitiesInvolvementsStatusEnum {
    COMPLETED
    CONTACT_ATTEMPTED
    DISPUTED
    IN_PROGRESS
    NOT_CONTACTED
    OPEN
}

type csafDocumentVulnerabilitiesInvolvements {
    date(
        exact: String
        should: String
        younger: String
        older: String): String
    party(
        enum: csafDocumentVulnerabilitiesInvolvementsPartyEnum): String
    status(
        enum: csafDocumentVulnerabilitiesInvolvementsStatusEnum): String
    summary(
        exact: String
        should: String): String
}

type csafDocumentVulnerabilitiesProductStatus {
    first_affected(
        exact: String
        should: String): [String] 
    first_fixed(
        exact: String
        should: String): [String]
    fixed(
        exact: String
        should: String): [String]
    known_affected(
        exact: String
        should: String): [String]
    known_not_affected(
        exact: String
        should: String): [String]
    last_affected(
        exact: String
        should: String): [String]
    recommended(
        exact: String
        should: String): [String]
    under_investigation(
        exact: String
        should: String): [String]
}

enum csafDocumentVulnerabilitiesRemediationsCategoryEnum {
    MITIGATION
    NO_FIX_PLANNED
    NONE_AVAILABLE
    VENDOR_FIX
    WORKAROUND
}

type csafDocumentVulnerabilitiesRemediations {
    category(
        enum: csafDocumentVulnerabilitiesRemediationsCategoryEnum): String
    date(
        exact: String
        should: String
        younger: String
        older: String): String
    details(
        exact: String
        should: String): String
    entitlements(
        exact: String
        should: String): [String]
    group_ids(
        exact: String
        should: String): [String]
    product_ids(
        exact: String
        should: String): [String]
    restart_required: csafDocumentVulnerabilitiesRemediationsRestartRequired
    url(
        exact: String
        should: String): String
}

enum csafDocumentVulnerabilitiesRemediationsRestartRequiredCategoryEnum {
    CONNECTED
    DEPENDENCIES
    MACHINE
    NONE
    PARENT
    SERVICE
    SYSTEM
    VULNERABLE_COMPONENT
    ZONE
}

type csafDocumentVulnerabilitiesRemediationsRestartRequired {
    category(
        enum: csafDocumentVulnerabilitiesRemediationsRestartRequiredCategoryEnum): String
    details(
        exact: String
        should: String): String
}

type csafDocumentVulnerabilitiesScores {
    cvss_v2: csafDocumentVulnerabilitiesScoresCvssV2
    cvss_v3: csafDocumentVulnerabilitiesScoresCvssV3
    products(
        exact: String
        should: String): [String]
}

type csafDocumentVulnerabilitiesScoresCvssV2 {
    version(
        exact: String
        should: String): String
    vectorString(
        exact: String
        should: String): String
    accessVector(
        exact: String
        should: String): String
    accessComplexity(
        exact: String
        should: String): String
    authentication(
        exact: String
        should: String): String
    confidentialityImpact(
        exact: String
        should: String): String
    integrityImpact(
        exact: String
        should: String): String
    availabilityImpact(
        exact: String
        should: String): String
    baseScore(
        lte: Float
        gte: Float): Float
    exploitability(
        exact: String
        should: String): String
    remediationLevel(
        exact: String
        should: String): String
    reportConfidence(
        exact: String
        should: String): String
    temporalScore: Float
    collateralDamagePotential(
        exact: String
        should: String): String
    targetDistribution(
        exact: String
        should: String): String
    confidentialityRequirement(
        exact: String
        should: String): String
    integrityRequirement(
        exact: String
        should: String): String
    availabilityRequirement(
        exact: String
        should: String): String
    environmentalScore: Float
}

type csafDocumentVulnerabilitiesScoresCvssV3 {
    version(
        exact: String
        should: String): String
    vectorString(
        exact: String
        should: String): String
    attackVector(
        exact: String
        should: String): String
    attackComplexity(
        exact: String
        should: String): String
    privilegesRequired(
        exact: String
        should: String): String
    userInteraction(
        exact: String
        should: String): String
    scope(
        exact: String
        should: String): String
    confidentialityImpact(
        exact: String
        should: String): String
    integrityImpact(
        exact: String
        should: String): String
    availabilityImpact(
        exact: String
        should: String): String
    baseScore(
        lte: Float
        gte: Float): Float
    exploitCodeMaturity(
        exact: String
        should: String): String
    remediationLevel(
        exact: String
        should: String): String
    reportConfidence(
        exact: String
        should: String): String
    temporalScore: Float
    temporalSeverity(
        exact: String
        should: String): String
    confidentialityRequirement(
        exact: String
        should: String): String
    integrityRequirement(
        exact: String
        should: String): String
    availabilityRequirement(
        exact: String
        should: String): String
    modifiedAttackVector(
        exact: String
        should: String): String
    modifiedAttackComplexity(
        exact: String
        should: String): String
    modifiedPrivilegesRequired(
        exact: String
        should: String): String
    modifiedUserInteraction(
        exact: String
        should: String): String
    modifiedScope(
        exact: String
        should: String): String
    modifiedConfidentialityImpact(
        exact: String
        should: String): String
    modifiedIntegrityImpact(
        exact: String
        should: String): String
    modifiedAvailabilityImpact(
        exact: String
        should: String): String
    environmentalScore: Float
    environmentalSeverity(
        exact: String
        should: String): String
}

enum csafDocumentVulnerabilitiesThreatsCategoryEnum {
    EXPLOIT_STATUS
    IMPACT
    TARGET_SET
}

type csafDocumentVulnerabilitiesThreats {
    category(
        enum: csafDocumentVulnerabilitiesThreatsCategoryEnum): String
    date(
        exact: String
        should: String
        younger: String
        older: String): String
    details(
        exact: String
        should: String): String
    group_ids(
        exact: String
        should: String): [String]
    product_ids(
        exact: String
        should: String): [String]
}
`;

module.exports = typeDefs;
