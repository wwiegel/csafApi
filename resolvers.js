var originalCsafApiFilter ={}; //csafApi
const graphQLhelper = require('./helper');
const { Intermediate, getIntermediateOriginalCsafApiFilter } = require('./connector/intermediate');
const logger = require("./logger");

/**
 * 
 * This function walks the tree structure from the leaf to the root node 
 * and concatenates the individual nodes with a slash, resulting in a JSON path.
 * 
 * @param {*} context_path ist the path attribute of a GraphQL context 
 * root
 *   node1
 *     node2
 *       leaf
 * 
 * @returns the GraphQL tree path as json path
 * /root/node1/node2/leaf
 * 
 * Nodes that do not belong to CSAF are ignored:
 * csafApi, documents
 * 
 * Nodes that act as array layer are ignored:
 * context_path.typename: undefined
 * 
 */
function generateJsonPathFromContextLoop(context_path){
    var path = "/" + context_path.key;

    //ignore !CSAF parts
    // TODO context_path.key == "csafApi" (streichen, da durch context_path.typename abgedeckt)
    if( context_path.key == "csafApi" ||
        context_path.typename == "Query" ||
        context_path.key == "documents"){
            path = "";
    }
    if(!context_path.typename){path = "";}

    // if there is a next, then root is not yet reached
    if (context_path.prev){
        path = generateJsonPathFromContextLoop(context_path.prev) + path;
    }

    return path;
}


/**
 * Query resolver and filter
 * 
 * The Query csafApi is a GraphQL query that needs to be resolved. Here is the resolving implemented.
 * 
 * All other functions are for array filtering the GraphQL context generated respectively translated files:
 * csafDocument:
 *   vulnerabilities for     /vulnerabilities[] 
 * csafDocumentDocument
 *   acknowledgments for     /document/acknowledgements[]
 *   notes for               /document/notes[]
 *   references for          /document/references[]
 * csafDocumentDocumentTracking
 *   aliases for             /document/tracking/aliases[]
 *   revision_history for    /document/tracking/revision_history[]
 * csafDocumentProductTree
 *   branches for            /product_tree/branches[]
 *   full_product_names for  /product_tree/full_product_names[]
 *   product_groups for      /product_tree/product_groups[]
 *   relationships for       /product_tree/relationships[]
 * csafDocumentVulnerabilities
 *   acknowledgments for     /vulnerabilities[]/acknowledgments[]
 *   flags for               /vulnerabilities[]/flags[]
 *   ids for                 /vulnerabilities[]/ids[]
 *   involvements for        /vulnerabilities[]/involvements[]                       -> TODO: - is not yet implemented
 *   notes for               /vulnerabilities[]/notes[]                              -> TODO: - is not yet implemented
 *   references for          /vulnerabilities[]/references[]                         -> TODO: - is not yet implemented
 *   remediations for        /vulnerabilities[]/remediations[]                       -> TODO: - is not yet implemented
 *   scores for              /vulnerabilities[]/scores[]                             -> TODO: - is not yet implemented
 *   threats for             /vulnerabilities[]/threats[]                            -> TODO: - is not yet implemented
 * csafDocumentVulnerabilitiesProductStatus
 *   first_affected for      /vulnerabilities[]/product_status/first_affected[]      -> TODO: - is not yet implemented
 *   first_fixed for         /vulnerabilities[]/product_status/first_fixed[]         -> TODO: - is not yet implemented
 *   fixed for               /vulnerabilities[]/product_status/fixed[]               -> TODO: - is not yet implemented
 *   known_affected for      /vulnerabilities[]/product_status/known_affected[]
 *   known_not_affected for  /vulnerabilities[]/product_status/known_not_affected[]  -> TODO: - is not yet implemented
 *   last_affected for       /vulnerabilities[]/product_status/last_affected[]       -> TODO: - is not yet implemented
 *   recommended for         /vulnerabilities[]/product_status/recommended[]         -> TODO: - is not yet implemented
 *   under_investigation for /vulnerabilities[]/product_status/under_investigation[] -> TODO: - is not yet implemented
 * branches_t
 *   branches for            ./branches[]/branches[]
 *                           /product_tree/branches[]/branches[]
 *                           /product_tree/branches[]/branches[]/branches[]
 * 
 */
module.exports = {
    Query: {
        /**
         * 
         * @param {*} root 
         * @param {*} obj 
         * @param {*} args user_token is here
         * @param {*} context full GraphQL query as JSON
         * @param {*} info 
         * @returns 
         */
        csafApi: (root, obj, args, context, info) => new Promise(
            (resolve, reject) => {
                Intermediate(context, args)
                    .then( r => {resolve(r)})
                    .catch(e => {
                        console.error(e);
                        logger.log("resolver", e);
                    })
                ;
                originalCsafApiFilter = getIntermediateOriginalCsafApiFilter();
            }
        ).catch(e => {
            console.error(e);
            logger.log("resolver", e);
        }),

        /*csafDocumentsFromDeviceList: () => {
            return 'Hello world 2!';
        }*/
    },
    /* 
        type csafDocument {
            document: csafDocumentDocument
            product_tree: csafDocumentProductTree
            vulnerabilities: [csafDocumentVulnerabilities]
        }
    */
    csafDocument:{
        /* 
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
        */
        vulnerabilities: (root, obj, args, context, info) => {
            var filteredArray = root.vulnerabilities;
            var path_V2 = generateJsonPathFromContextLoop(context.path);

            if(filteredArray){
                //acknowledgments[] is an array, and is filtered elsewhere (see csafDocumentVulnerabilities->acknowledgments)
                //filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "acknowledgments");
                //cve summary
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "cve");
                //cwe summary
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "cwe");
                //discovery_date summary
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "discovery_date");
                //flags[] is an array, and is filtered elsewhere (see csafDocumentVulnerabilities->flags)
                //filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "flags");
                //ids[] is an array, and is filtered elsewhere (see csafDocumentVulnerabilities->ids)
                //filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "ids");
                //involvements[] is an array, and is filtered elsewhere (see csafDocumentVulnerabilities->involvements)
                //filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "involvements");
                //notes[] is an array, and is filtered elsewhere (see csafDocumentVulnerabilities->notes)
                //filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "notes");
                //product_status summary
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "product_status");
                //references[] is an array, and is filtered elsewhere (see csafDocumentVulnerabilities->references)
                //filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "references");
                //release_date summary
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "release_date");
                //remediations[] is an array, and is filtered elsewhere (see csafDocumentVulnerabilities->remediations)
                //filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "remediations");
                //scores[] is an array, and is filtered elsewhere (see csafDocumentVulnerabilities->scores)
                //filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "scores");
                //threats[] is an array, and is filtered elsewhere (see csafDocumentVulnerabilities->treats)
                //filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "threats");
                //title summary
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "title");
            }

            return filteredArray;
        }
    },
    csafDocumentDocument:{
        // /document/acknowledgments[] has arrays
        // that is why it needs to be filtered
        acknowledgments:(root, obj, args, context, info) => {
            var filteredArray = root.acknowledgments;
            var path_V2 = generateJsonPathFromContextLoop(context.path);

            if(filteredArray){
                //names[] is an array, and is filtered elsewhere (see acknowledgments_t->names)
                //filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "names");
                ////organization Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "organization");
                ////summary Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "summary");
                //urls[] is an array, and is filtered elsewhere (see acknowledgments_t->urls)
                //filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "urls");
            }

            return filteredArray;
        },
        // /document/notes is an array of objects
        // that is why it needs to be filtered on subelements
        notes:(root, obj, args, context, info) => {
            var filteredArray = root.notes;
            var path_V2 = generateJsonPathFromContextLoop(context.path);

            if(filteredArray){
                //audience Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "audience");
                //category Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "category");
                //text Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "text");
                //title Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "title");
            }

            return filteredArray;
        },
        // document.references is an array
        // that is why it needs to be filtered
        references:(root, obj, args, context, info) => {
            var filteredArray = root.references;
            var path_V2 = generateJsonPathFromContextLoop(context.path);

            if(filteredArray){
                //category Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "category");
                //text summary
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "summary");
                //url url
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "url");
            }

            return filteredArray;
        }
    },
    csafDocumentDocumentTracking: {
        // /document/tracking/aliases[] is an array
        // that is why it needs to be filtered
        aliases:(root, obj, args, context, info) => {
            var filteredArray = root.aliases;
            var path_V2 = generateJsonPathFromContextLoop(context.path);

            if(filteredArray){
                //names Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "names");
                //organization Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "organization");
                //summary Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "summary");
                //urls Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "urls");
            }

            return filteredArray;
        },
        // document.tracking.revision_history is an array
        // that is why it needs to be filtered
        revision_history:(root, obj, args, context, info) => {
            var filteredArray = root.revision_history;

            if(filteredArray){
                //date Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, "/document/tracking/revision_history", "date");
                //legacy_version Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, "/document/tracking/revision_history", "legacy_version");
                //number Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, "/document/tracking/revision_history", "number");
                //summary Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, "/document/tracking/revision_history", "summary");
            }

            return filteredArray;
        },
        /*current_release_date: (parent, args, context) => {
            if(args != null){
                if(args.keyword != null){
                    console.log("current_release_date:" + parent.current_release_date + " keyword:" + args.keyword);
                }
            }
            return parent.current_release_date;
        },
        //generator: csafDocumentDocumentTrackingGenerator
        id: (parent, args, contextValue, info) => new Promise((resolve, reject) => {
            //var tempElasticSearchDocumentById = elasticSearchDocumentById
            //tempElasticSearchDocumentById['query']['bool']['must'][0]['match']["document.tracking.id.keyword"] = documentTrackingId;
            //tempElasticSearchDocumentById['query']['bool']['must'][1]['match']["document.publisher.namespace.keyword"] = documentPublisherNamespace;
            //ElasticSearchClient({ ...tempElasticSearchDocumentById })
            //    .then(
                r => {
                    let _source = r['hits']['hits'];
                    _source.map((item, i) => _source[i] = item._source);
                    resolve(JSON.parse('{"graphQl":' + JSON.stringify(_source) + ', "base64CsafDocument" : "' + Buffer.from(JSON.stringify(_source)).toString("base64") + '"}'));
                }
            //    );
        }
        ),
        initial_release_date: (parent, args, context) => {
            return 'Hello world 2!';
        },
        //revision_history: [csafDocumentDocumentTrackingRevisionHistory]
        status: (parent, args, context) => {
            return 'Hello world 2!';
        },
        version: (parent, args, context) => {
            return 'Hello world 2!';
        }*/
    },
    /*
        type csafDocumentProductTree {
            branches: [branches_t]
            full_product_names: [full_product_name_t]
            product_groups: [csafDocumentProductTreeProductGroups]
            relationships: [csafDocumentProductTreeRelationships]
        }
    */
    csafDocumentProductTree: {
        // document.references is an array
        // that is why it needs to be filtered
        /*
            type branches_t {
                branches: [branches_t]
                category(
                    exact: String
                    should: String): String
                name(
                    exact: String
                    should: String): String
                product: full_product_name_t
            }
        */
        branches:(root, obj, args, context, info) => {
            var filteredArray = root.branches;

            if(filteredArray){
                //branches Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, "/product_tree/branches", "branches");
                //category Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, "/product_tree/branches", "category");
                //name Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, "/product_tree/branches", "name");
                //product Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, "/product_tree/branches", "product");
            }

            return filteredArray;
        },
        /*
            type full_product_name_t {
                name(
                    exact: String
                    should: String): String
                product_id(
                    exact: String
                    should: String): String
                product_identification_helper: full_product_name_tProductIdentificationHelper
            }
        */
        full_product_names:(root, obj, args, context, info) => {
            var filteredArray = root[[context.path.key]];
            var path_V2 = generateJsonPathFromContextLoop(context.path);

            if(filteredArray){
                //name Filter: product_tree.full_product_names.name
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "name");
                //product_id Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "product_id");
                //product_identification_helper Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "product_identification_helper");
            }

            return filteredArray;
        },
        product_groups:(root, obj, args, context, info) => {
            var filteredArray = root.product_groups;
            var path_V2 = generateJsonPathFromContextLoop(context.path);

            if(filteredArray){
                //category Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "category");
                //text Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "summary");
                //url Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "url");
            }

            return filteredArray;
        },
        relationships:(root, obj, args, context, info) => {
            var filteredArray = root.relationships;
            var path_V2 = generateJsonPathFromContextLoop(context.path);

            if(filteredArray){
                //category Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "category");
                //summary Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "summary");
                //url Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "url");
            }

            return filteredArray;
        }
    },
    /* 
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
    TODO        involvements: [csafDocumentVulnerabilitiesInvolvements]
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
    */
    csafDocumentVulnerabilities: {
        /* 
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
        */
        acknowledgments:(root, obj, args, context, info) => {
            var filteredArray = root.acknowledgments;
            var path_V2 = generateJsonPathFromContextLoop(context.path);

            if(filteredArray){
                //names Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "names");
                //organization Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "organization");
                //summary Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "summary");
                //urls Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "urls");
            }

            return filteredArray;
        },
        /* 
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
                    exact: String
                    should: String): String
                product_ids(
                    exact: String
                    should: String): [String]
            }
        */
        flags:(root, obj, args, context, info) => {
            var filteredArray = root.flags;
            var path_V2 = generateJsonPathFromContextLoop(context.path);

            if(filteredArray){
                //date Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "date");
                //group_ids Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "group_ids");
                //label Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "label");
                //product_ids Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "product_ids");
            }

            return filteredArray;
        },
        /* 
            type csafDocumentVulnerabilitiesIds {
                system_name(
                    exact: String
                    should: String): String
                text(
                    exact: String
                    should: String): String
            }
        */
        ids:(root, obj, args, context, info) => {
            var filteredArray = root.ids;
            var path_V2 = generateJsonPathFromContextLoop(context.path);

            if(filteredArray){
                //system_name Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "system_name");
                //text Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path_V2, "text");
            }

            return filteredArray;
        }
    },
    /*
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
    */
    csafDocumentVulnerabilitiesProductStatus: {
        known_affected:(root, obj, args, context, info) => {
            var filteredArray = root.known_affected;
            
            /*
            // experimental part, implementation is not finished
            if(filteredArray){
                var extendedFilter = graphQLhelper.isFilterVulnerabilitiesProductStatusOnProductTreeFullProductNamesProductId(context, originalContext);
                if(extendedFilter){
                    filteredArray = graphQLhelper.extendedFilter(filteredArray, "vulnerabilities.product_status.known_affected", "product_tree.full_product_names.product_id");
                } 
            }*/

            return filteredArray;
        }
    },

    /*
        type branches_t {
            branches: [branches_t]
            category(
                exact: String
                should: String): String
            name(
                exact: String
                should: String): String
            product: full_product_name_t
        }
    */
    branches_t: {
        // document.references is an array
        // that is why it needs to be filtered
        /*
            type branches_t {
                branches: [branches_t]
                category(
                    exact: String
                    should: String): String
                name(
                    exact: String
                    should: String): String
                product: full_product_name_t
            }
        */
        branches:(root, obj, args, context, info) => {
            var filteredArray = root.branches;
            var path = generateJsonPathFromContextLoop(context.path)

            if(filteredArray){
                //branches Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path, "branches");
                //category Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path, "category");
                //name Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path, "name");
                //product Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path, "product");
            }

            return filteredArray;
        },

        /*
            
            TODO: If this is not an array, why is an array filter applied?
            Because the array filter should be applied to branches and as a filter 
            criterion should be ./branches/product/name.
            This is a prototype for nested array filters, so it is not fully developed yet.

            type full_product_name_t {
                name: String
                product_id: String
                product_identification_helper: full_product_name_tProductIdentificationHelper
            }
        */
        product:(root, obj, args, context, info) => {
            var filteredArray = root.product;
            var path = generateJsonPathFromContextLoop(context.path)

            if(path == "/product_tree/branches/branches/branches/product"){
                var stop = true;
            }

            if(filteredArray){
                //name Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path, "name");
                //product_id Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path, "product_id");
                //product_identification_helper Filter
                filteredArray = graphQLhelper.filterArray_V2(context, filteredArray, originalCsafApiFilter, path, "product_identification_helper");
            }

            return filteredArray;
        }
    }

    //TODO: acknowledgments_t
    //->names
    //->urls
};
