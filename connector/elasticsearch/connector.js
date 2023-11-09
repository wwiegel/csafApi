const config = require("../../config");
const errors = require("../../data/error_messages");
const { csafDocument } = require("../../resolvers");
const { ElasticSearchClient } = require('./elasticsearchclient');

class connector {
    constructor(){
        this.name = "elasticsearch";
    }
}
const elasticsearchConnector = new connector();


function Connector(intermediateObject){
    //Im intermediateToElasticsearchQuery fehlt der Fall, 
    //wenn gar keine Argumente mitgegeben werden, also match all
    // Dieser Fall tritt nicht mehr ein, da immer mindestens die TLP label gesetzt sind
    var elasticSearchQuery = {};
    //if(intermediateObject.search_arguments.length == 0){
    //    elasticSearchQuery = {"match_all": {}};
    //}else{
        elasticSearchQuery = intermediateToElasticsearchQuery(intermediateObject, undefined);
    //}

    //query the vulnerabilities.product_status dependent to the id of a product_tree.full_product_names_name
    //needs two queries
    // 1: query the product.id by product.name
    //    Attention: First query Parameter (max_documents) must be near unlimited.
    // 2. query all findDocument parameter plus the found tupel (product.id, document.tracing.id)
    var needPreQuery = testNeedPreQuery(intermediateObject);
    if(needPreQuery){
        //do prequery
        elasticSearchQuery.size = config.csafElasticsearch.maxPreQuerySize;
        const prePromise = ElasticSearchClient(elasticSearchQuery)
        .then(
            //change response comming from elasticsearch
            r => {
                let results = r['hits']['hits'];
                results.map((item, i) => results[i] = item._source);

                //remove documents with wrong status
                results = removeWrongStatus(results, intermediateObject);

                //remove surplus documents (max_documents)
                results = removeSurplus(results, intermediateObject);

                results = { "documents": results };

                return results;

                //every result has a document.tracking.id and product_ids
                //the new query needs to be joind with each result tupel (document.tracking.id and product_ids),
                //this means: query the query a second time but now additional with the product_id (as a must creterion)
                //one of the tupel ist a must, so they all tupel are should concatenated:
                // must.bool.should.[all_tupels]
                // must.bool.should.bool.must.match (document.tracking.id)
                //                           .match (product_id)
                var newElasticSearchQuery = intermediateToElasticsearchQuery(intermediateObject, results);

                return ElasticSearchClient(newElasticSearchQuery)
                .then(
                    //change response comming from elasticsearch
                    r => {
                        //elasticsearch gives a lot of metadata, for our purpose, we only use the hits (csaf documents)
                        let _source = r['hits']['hits'];
                        _source.map((item, i) => _source[i] = item._source);
                        //let the documents appear directly unter the queryname
                        _source = { "documents": _source };

                        //TODO: nested objects
                        /**
                         * The recursive nested object from response must match to the new_return_object.
                         * The following recursively nested object could exist:
                         * product_tree.branches
                         * product_tree.branches.branches
                         * product_tree.branches.branches.branches
                         */
                        return _source;
                    }
                )
                .catch(
                    e => {
                        logger.log("elasticsearch", e);
                        console.error("csafError: fail after pre-query [user]");
                        console.log("csafError: fail after pre-query [admin]");
                        console.error(e);
                    }
                );
            }
        )
        .catch(
            e => {
                console.error(e);
                logger.log("elasticsearch", e);
            }
        );
        return prePromise;
        var stop = 10;
    }



    //ist bereits gesetzt
    //elasticSearchQuery.size = intermediateObject.max_documents;

    // run query
    return ElasticSearchClient(elasticSearchQuery)
    .then(
        //change response comming from elasticsearch
        r => {
            //elasticsearch gives a lot of metadata, for our purpose, we only use the hits (csaf documents)
            let results = r['hits']['hits'];

            results.map((item, i) => results[i] = item._source);
            //let the documents appear directly unter the queryname
            results = { 
                "documents": results,
                "metadata": {
                    "total": r.hits.total.value
                } 
            };

            //TODO: nested objects
            /**
             * The recursive nested object from response must match to the new_return_object.
             * The following recursively nested object could exist:
             * product_tree.branches
             * product_tree.branches.branches
             * product_tree.branches.branches.branches
             */
            return results;
        }
    )
    .catch(
        e => {
            if(!errors.csafElasticsearch[e.displayName]){console.log("WARNING:CONNECTOR:ELASTICSEARCH#MISSING#ERRORMESSAGE#displayName: " + e.displayName);}
            console.log("ERROR:CONNECTOR:ELASTICSEARCH#" + e.displayName + "## failing query: " + JSON.stringify(elasticSearchQuery));
            logger.log("elasticsearch", e);
            return {
                "error": errors.csafElasticsearch[e.displayName] ? errors.csafElasticsearch[e.displayName] : errors.csafElasticsearch.undefined
            }
        }
    );
}

//remove documents with wrong status
function removeWrongStatus(results, intermediateObject){
    let productNames = extractProductNames(intermediateObject);
    let productStatuses = extractProductStatus(intermediateObject);
    let r = 0;
    let remove = true;
    var productName = "";
    var productIds = [];
    var productId = "";
    var productStatus = "";
    while(r < results.length){
        let i = 0;
        while(i < productNames.length &&
            remove
        ){
            let s = 0;
            while(s < productStatuses.length &&
                remove
            ){
                productStatus = productStatuses[s].name;
                productName = productNames[i].value;
                productIds = findProductIdByName(results[r], productName);
                let p = 0;
                while(p < productIds.length &&
                    remove
                ){
                    productId = productIds[p];
                    let v = 0;
                    while(v < results[r].vulnerabilities.length &&
                        remove
                    ){
                        if(results[r].vulnerabilities[v].product_status){
                            //idInProductTreeProductGroupsProductIds: Boolean
                            //idInProductTreeRelationshipsProductReference: Boolean
                            //idInProductTreeRelationshipsRelatesToProductReference: Boolean
                            //idInVulnerabilitiesProductStatusFirstAffected: Boolean
                            if(productStatuses[s].idInVulnerabilitiesProductStatusFirstAffected){
                                let ps_ka = 0;
                                if(results[r].vulnerabilities[v].product_status.first_affected){
                                    while(ps_ka < results[r].vulnerabilities[v].product_status.first_affected.length &&
                                        remove
                                    ){
                                        if(productStatuses[s].idInVulnerabilitiesProductStatusFirstAffected &&
                                        results[r].vulnerabilities[v].product_status.first_affected[ps_ka] == productId ){
                                            remove = false;
                                        }
                                        ps_ka++;
                                    }
                                }
                            }
                            //idInVulnerabilitiesProductStatusFirstFixed: Boolean
                            else if(productStatuses[s].idInVulnerabilitiesProductStatusFirstFixed){
                                let ps_ka = 0;
                                if(results[r].vulnerabilities[v].product_status.first_fixed){
                                    while(ps_ka < results[r].vulnerabilities[v].product_status.first_fixed.length &&
                                        remove
                                    ){
                                        if(productStatuses[s].idInVulnerabilitiesProductStatusFirstFixed &&
                                        results[r].vulnerabilities[v].product_status.first_fixed[ps_ka] == productId ){
                                            remove = false;
                                        }
                                        ps_ka++;
                                    }
                                }
                            }
                            //idInVulnerabilitiesProductStatusFixed: Boolean
                            else if(productStatuses[s].idInVulnerabilitiesProductStatusFixed){
                                let ps_ka = 0;
                                if(results[r].vulnerabilities[v].product_status.fixed){
                                    while(ps_ka < results[r].vulnerabilities[v].product_status.fixed.length &&
                                        remove
                                    ){
                                        if(productStatuses[s].idInVulnerabilitiesProductStatusFixed &&
                                        results[r].vulnerabilities[v].product_status.fixed[ps_ka] == productId ){
                                            remove = false;
                                        }
                                        ps_ka++;
                                    }
                                }
                            }
                            //idInVulnerabilitiesProductStatusKnownAffected: Boolean
                            else if(productStatuses[s].idInVulnerabilitiesProductStatusKnownAffected){
                                let ps_ka = 0;
                                if(results[r].vulnerabilities[v].product_status.known_affected){
                                    while(ps_ka < results[r].vulnerabilities[v].product_status.known_affected.length &&
                                        remove
                                    ){
                                        if(productStatuses[s].idInVulnerabilitiesProductStatusKnownAffected &&
                                        results[r].vulnerabilities[v].product_status.known_affected[ps_ka] == productId ){
                                            remove = false;
                                        }
                                        ps_ka++;
                                    }
                                }
                            }
                            //idInVulnerabilitiesProductStatusKnownNotAffected: Boolean
                            else if(productStatuses[s].idInVulnerabilitiesProductStatusKnownNotAffected){
                                let ps_ka = 0;
                                if(results[r].vulnerabilities[v].product_status.known_not_affected){
                                    while(ps_ka < results[r].vulnerabilities[v].product_status.known_not_affected.length &&
                                        remove
                                    ){
                                        if(productStatuses[s].idInVulnerabilitiesProductStatusKnownNotAffected &&
                                        results[r].vulnerabilities[v].product_status.known_not_affected[ps_ka] == productId ){
                                            remove = false;
                                        }
                                        ps_ka++;
                                    }
                                }
                            }
                            //idInVulnerabilitiesProductStatusLastAffected: Boolean
                            else if(productStatuses[s].idInVulnerabilitiesProductStatusLastAffected){
                                let ps_ka = 0;
                                if(results[r].vulnerabilities[v].product_status.last_affected){
                                    while(ps_ka < results[r].vulnerabilities[v].product_status.last_affected.length &&
                                        remove
                                    ){
                                        if(productStatuses[s].idInVulnerabilitiesProductStatusLastAffected &&
                                        results[r].vulnerabilities[v].product_status.last_affected[ps_ka] == productId ){
                                            remove = false;
                                        }
                                        ps_ka++;
                                    }
                                }
                            }
                            //idInVulnerabilitiesProductStatusRecommended: Boolean
                            else if(productStatuses[s].idInVulnerabilitiesProductStatusRecommended){
                                let ps_ka = 0;
                                if(results[r].vulnerabilities[v].product_status.recommended){
                                    while(ps_ka < results[r].vulnerabilities[v].product_status.recommended.length &&
                                        remove
                                    ){
                                        if(productStatuses[s].idInVulnerabilitiesProductStatusRecommended &&
                                        results[r].vulnerabilities[v].product_status.recommended[ps_ka] == productId ){
                                            remove = false;
                                        }
                                        ps_ka++;
                                    }
                                }
                            }
                            //idInVulnerabilitiesProductStatusUnderInvestigation: Boolean
                            else if(productStatuses[s].idInVulnerabilitiesProductStatusUnderInvestigation){
                                let ps_ka = 0;
                                if(results[r].vulnerabilities[v].product_status.under_investigation){
                                    while(ps_ka < results[r].vulnerabilities[v].product_status.under_investigation.length &&
                                        remove
                                    ){
                                        if(productStatuses[s].idInVulnerabilitiesProductStatusUnderInvestigation &&
                                        results[r].vulnerabilities[v].product_status.under_investigation[ps_ka] == productId ){
                                            remove = false;
                                        }
                                        ps_ka++;
                                    }
                                }
                            }
                            //idInVulnerabilitiesFlagsProductIds: Boolean
                            //idInVulnerabilitiesRemediationsProductIds: Boolean
                            //idInVulnerabilitiesScoresProducts: Boolean
                            //idInVulnerabilitiesThreatsProductIds: Boolean
                            else {
                                let ps_ka = 0;
                                while(ps_ka < results[r].vulnerabilities[v].product_status.known_affected.length){
                                    if(productStatuses[s].idInVulnerabilitiesProductStatusKnownAffected &&
                                    results[r].vulnerabilities[v].product_status.known_affected[ps_ka] == productId ){
                                        remove = false;
                                    }
                                    ps_ka++;
                                }
                            }
                        }
                        v++;
                    }
                    p++;
                }
                s++;
            }
            i++;
        }
        if(remove == true){
            results.splice(r, 1);
        }else{
            remove = true;
            r++;
        }
    }
    return results;
}

function findProductIdByName(csafDocument, productName){
    var productId = [];

    if(csafDocument.product_tree){
        if(csafDocument.product_tree.full_product_names){
            let i = 0;
            while(i < csafDocument.product_tree.full_product_names.length){
                if(csafDocument.product_tree.full_product_names[i].name.indexOf(productName) >= 0){
                    productId[productId.length] = csafDocument.product_tree.full_product_names[i].product_id;
                }
                i++;
            }
        }
        if(csafDocument.product_tree.branches){
            let j = 0;
            while(j < csafDocument.product_tree.full_product_names.length){
                if(csafDocument.product_tree.full_product_names[j].name == productName){
                    productId[productId.length] = csafDocument.product_tree.full_product_names[j].product_id;
                }
                i++;
            }
        }
    }

    return productId;
}

function extractProductNames(intermediateObject){
    var productNames = [];
    if(intermediateObject.subElements){
        let i = 0;
        while(i < intermediateObject.subElements.length){
            var tempProductIds =  extractProductNames(intermediateObject.subElements[i]);
            let j = 0;
            while(j < tempProductIds.length){
                productNames[productNames.length] = tempProductIds[j];
                j++;
            }
            i++;
        }
    }
    if(intermediateObject.name == "full_product_names" ||
       intermediateObject.name == "product" ||
       intermediateObject.name == "byProduct"
       ){
        let i = 0;
        while(i < intermediateObject.subElements.length){
            if(intermediateObject.subElements[i].name == "name" &&
               intermediateObject.subElements[i].arguments
            ){
                let a = 0;
                while(a < intermediateObject.subElements[i].arguments.length){
                    if(intermediateObject.subElements[i].arguments[a].should ||
                       intermediateObject.subElements[i].arguments[a].exact 
                    ){
                        productNames[productNames.length] = intermediateObject.subElements[i].arguments[a];
                    }
                    a++;
                }
            }
            i++;
        }
    }
    return productNames;
}
function extractProductStatus(intermediateObject){
    var productStatus = [];
    let i = 0;
    while(i < intermediateObject.search_arguments.length){
        if(intermediateObject.search_arguments[i].idInProductTreeProductGroupsProductIds ||
           intermediateObject.search_arguments[i].idInProductTreeRelationshipsProductReference ||
           intermediateObject.search_arguments[i].idInProductTreeRelationshipsRelatesToProductReference ||
           intermediateObject.search_arguments[i].idInVulnerabilitiesProductStatusFirstFixed ||
           intermediateObject.search_arguments[i].idInVulnerabilitiesProductStatusFixed ||
           intermediateObject.search_arguments[i].idInVulnerabilitiesProductStatusKnownAffected ||
           intermediateObject.search_arguments[i].idInVulnerabilitiesProductStatusKnownNotAffected ||
           intermediateObject.search_arguments[i].idInVulnerabilitiesProductStatusRecommended ||
           intermediateObject.search_arguments[i].idInVulnerabilitiesProductStatusUnderInvestigation
            ){
            productStatus[productStatus.length] = intermediateObject.search_arguments[i];
        }
        i++;
    }
    return productStatus;
}

//remove surplus documents (max_documents)
function removeSurplus(results, intermediateObject){
    let max_documents = intermediateObject.max_documents;
    while(max_documents < results.length){
        results.splice(max_documents, 1);
    }
    return results;
}

function createElasticsearchObject(object, results, pathextension){
    var elasticsearchObject = [];

    if (object.subElements) {
        let i = 0;
        while(i < object.subElements.length){
            var temp = createElasticsearchObject(object.subElements[i], results, pathextension);
            let j =0;
            while (j <temp.length){
                elasticsearchObject[elasticsearchObject.length] = temp[j];
                j++;
            }
            i++;
        }
    } else {
        var temp = createElasticsearchArguments(object.arguments, results, pathextension);
        let j =0;
        while (j <temp.length){
            elasticsearchObject[elasticsearchObject.length] = temp[j];
            j++;
        }
    }

    return elasticsearchObject;
}

function createElasticsearchArguments (arguments, results, pathextension){
    var elasticsearchArguments = [];

    let i = 0;
    while (i < arguments.length){
        let temp =createElasticsearchArgument(arguments[i], results, pathextension);
        if(temp){
            elasticsearchArguments[elasticsearchArguments.length] = temp;
        }
        i++;
    }

    return elasticsearchArguments;
}

function createElasticsearchArgument(argument, results, pathextension){
    var elasticsearchArgument = null;

    var newTreepath = pathextension ? pathextension + "." + argument.treepath : argument.treepath;

    if (argument.name == "should"){
        elasticsearchArgument = {
            "bool": {
                "should": [{
                    "match": {
                        [newTreepath]: argument.value
                    }
                }]
            }
        }
    } else if (argument.name == "path"){
        let tempValue = argument.value.replace(/\//g, ".");
        if(tempValue.slice(0, 1) == "."){
            tempValue = tempValue.slice(1);
        }
        elasticsearchArgument = {
            "exists": {
                "field": tempValue
            }
        }
    } else if (
        argument.name == "exact" ||
        argument.name == "enum"
    ){
        elasticsearchArgument = {
            "match": {
                [newTreepath + "." + "keyword"]: argument.value
            }
        }
    } else if (
        argument.name == "idInVulnerabilitiesProductStatusFirstAffected" ||
        argument.name == "idInVulnerabilitiesProductStatusFirstFixed" ||
        argument.name == "idInVulnerabilitiesProductStatusFixed" ||
        argument.name == "idInVulnerabilitiesProductStatusKnownAffected" ||
        argument.name == "idInVulnerabilitiesProductStatusKnownNotAffected" ||
        argument.name == "idInVulnerabilitiesProductStatusLastAffected" ||
        argument.name == "idInVulnerabilitiesProductStatusRecommended" ||
        argument.name == "idInVulnerabilitiesProductStatusUnderInvestigation" ||
        argument.name == "idInProductTreeProductGroupsProductIds" ||
        argument.name == "idInProductTreeRelationshipsProductReference" ||
        argument.name == "idInProductTreeRelationshipsRelatesToProductReference" ||
        argument.name == "idInVulnerabilitiesFlagsProductIds" ||
        argument.name == "idInVulnerabilitiesRemediationsProductIds" ||
        argument.name == "idInVulnerabilitiesScoresProducts" ||
        argument.name == "idInVulnerabilitiesThreatsProductIds"
    ){
        elasticsearchArgument = createIdInObjectFrom(results, argument);
    } else if (
        argument.name == "gte" ||
        argument.name == "younger"
    ){
        elasticsearchArgument = {
            "range": {
                [newTreepath]: {
                    "gte": argument.value
                }
            }
        }
    } else if (
        argument.name == "lte" ||
        argument.name == "older"
    ){
        elasticsearchArgument = {
            "range": {
                [newTreepath]: {
                    "lte": argument.value
                }
            }
        }
    } else {
        var undefined = "stop";
    }

    return elasticsearchArgument;
}

function findArgument(intermediateObject, argumentName){
    let found = false;

    if(intermediateObject.subElements){
        let i = 0;
        while(i<intermediateObject.subElements.length && found == false){
            let temp = findArgument(intermediateObject.subElements[i], argumentName);
            if(temp){
                found = true;
            }
            i++;
        }
    }

    if(intermediateObject.arguments){
        let j = 0;
        while(j < intermediateObject.arguments.length){
            if(intermediateObject.arguments[j].name == argumentName){
                found = true;
            }
            j++;
        }
    }

    return found;
}

function testNeedPreQuery(intermediateObject){
    let test = false;

    let argumentNames = [
        "idInProductTreeProductGroupsProductIds",
        "idInProductTreeRelationshipsProductReference",
        "idInProductTreeRelationshipsRelatesToProductReference",
        "idInVulnerabilitiesProductStatusFirstAffected",
        "idInVulnerabilitiesProductStatusFirstFixed",
        "idInVulnerabilitiesProductStatusFixed",
        "idInVulnerabilitiesProductStatusKnownAffected",
        "idInVulnerabilitiesProductStatusKnownNotAffected",
        "idInVulnerabilitiesProductStatusLastAffected",
        "idInVulnerabilitiesProductStatusRecommended",
        "idInVulnerabilitiesProductStatusUnderInvestigation",
        "idInVulnerabilitiesFlagsProductIds",
        "idInVulnerabilitiesRemediations",
        "idInVulnerabilitiesScoresProducts",
        "idInVulnerabilitiesThreatsProductIds"
    ];
    let i = 0;
    while (i < argumentNames.length && test == false){
        if(findArgument(intermediateObject, argumentNames[i])){
            test = true;
        }
        i++;
    }

    return test;
}

function createElasticsearchQueryLoop(loopObject, results, intermediateObject){
    var elasticsearchObject = {};

    if(loopObject.name == "findDocuments") {
        // 29.08.2023 changed to must, because the design subsection (3.4.1 csafApi - findDocuments) tells so
        elasticsearchObject = createBoolObject("must", loopObject, results, intermediateObject);
    } else if (loopObject.name == "csafAnd" || loopObject.name == "must"){
        elasticsearchObject = createBoolObject("must", loopObject, results, intermediateObject);
    } else if (loopObject.name == "csafOr" || loopObject.name == "should"){
        elasticsearchObject = createBoolObject("should", loopObject, results, intermediateObject);
    } else if (loopObject.name == "csafNot" || loopObject.name == "must_not"){
        elasticsearchObject = createBoolObject("must_not", loopObject, results, intermediateObject);
    } else if (loopObject.name == "csafXor"){
        if(loopObject.subElements.length == 2){
            let condition1 = createElasticsearchQueryLoop(loopObject.subElements[0], results, intermediateObject);
            let condition2 = createElasticsearchQueryLoop(loopObject.subElements[1], results, intermediateObject);

            elasticsearchObject = {
                "bool": {"should": [
                    {"bool": {"must": [
                        {"bool": {"must":     condition1 }},
                        {"bool": {"must_not": condition2 }}
                    ]}},
                    {"bool": {"must": [
                        {"bool": {"must_not": condition1 }},
                        {"bool": {"must":     condition2 }}
                    ]}}
                ]}
            }
            let i = 0;
            i++;
        } else {
            //TODO: error
            console.error("csafError: csafXor needs exactly 2 conditions [user]");
            console.log("csafError: csafXor needs exactly 2 conditions [admin]");
        }
    } else {
        elasticsearchObject = createElasticsearchObject(loopObject, results);
    }

    return elasticsearchObject;
}

function createBoolObject (bool, loopObject, results, intermediateObject){
    var elasticsearchObject = {};

    var generatedSubElements = [];
    let i = 0;
    if(!loopObject.subElements){
        var stop = true;
    }
    while (i < loopObject.subElements.length){
        let temp = createElasticsearchQueryLoop(loopObject.subElements[i], results, intermediateObject);
        if(temp.length){
            let j = 0;
            while(j<temp.length){
                generatedSubElements[generatedSubElements.length] = temp[j];
                j++;
            }
        }else{
            generatedSubElements[generatedSubElements.length] = temp;
        }
        i++;
    }
    elasticsearchObject = {
        "bool":{
            [bool]: generatedSubElements
        }
    }

    return elasticsearchObject;
}

function createIdInObjectFrom(results, argument){
    var elasticsearchArgument = {};
    var field = "";
    if(argument.name      == "idInProductTreeProductGroupsProductIds")               { field = "product_tree.product_groups.product_ids";}
    else if(argument.name == "idInProductTreeRelationshipsProductReference")         { field = "product_tree.relationships.product_reference";}
    else if(argument.name == "idInProductTreeRelationshipsRelatesToProductReference"){ field = "product_tree.relationships.elates to product reference";}
    else if(argument.name == "idInVulnerabilitiesProductStatusFirstAffected")        { field = "vulnerabilities.product_status.first_affected";}
    else if(argument.name == "idInVulnerabilitiesProductStatusFirstFixed")           { field = "vulnerabilities.product_status.first_fixed";}
    else if(argument.name == "idInVulnerabilitiesProductStatusFixed")                { field = "vulnerabilities.product_status.fixed";}
    else if(argument.name == "idInVulnerabilitiesProductStatusKnownAffected")        { field = "vulnerabilities.product_status.known_affected";}
    else if(argument.name == "idInVulnerabilitiesProductStatusKnownNotAffected")     { field = "vulnerabilities.product_status.known_not_affected";}
    else if(argument.name == "idInVulnerabilitiesProductStatusLastAffected")         { field = "vulnerabilities.product_status.last_affected";}
    else if(argument.name == "idInVulnerabilitiesProductStatusRecommended")          { field = "vulnerabilities.product_status.recommended";}
    else if(argument.name == "idInVulnerabilitiesProductStatusUnderInvestigation")   { field = "vulnerabilities.product_status.under_investigation";}
    else if(argument.name == "idInVulnerabilitiesFlagsProductIds")                   { field = "vulnerabilities.flags.product_ids";}
    else if(argument.name == "idInVulnerabilitiesRemediationsProductIds")            { field = "vulnerabilities.remediations.product_ids";}
    else if(argument.name == "idInVulnerabilitiesScoresProducts")                    { field = "vulnerabilities.scores.products";}
    else if(argument.name == "idInVulnerabilitiesThreatsProductIds")                 { field = "vulnerabilities.threats.product_ids";}

    // TODO: writen for product_tree.full_product_names.product_id
    // Does not work for product_tree.branches[.branches]*.product.product_id
    if(results && results.length > 0 && argument.treepath == "product_tree.full_product_names.product_id"){
    //if(results && results.length > 0){
        var temp = [];
        let i = 0;
        while(i < results.length){
            if(results[i].product_tree.full_product_names){
                let j = 0;
                while(j < results[i].product_tree.full_product_names.length){
                    temp[temp.length] = {
                        "bool": {
                            "must": [
                                {"match": {[argument.treepath]: results[i].product_tree.full_product_names[j].product_id}},
                                {"match": {"document.tracking.id": results[i].document.tracking.id}},
                                {"match": {[field]: results[i].product_tree.full_product_names[j].product_id}}
                            ]
                        }
                    };
                    j++;
                }
            }else{
                // TODO: writen for product_tree.full_product_names.product_id
                // Does not work for product_tree.branches[.branches]*.product.product_id
                var stop = true;
            }
            i++;
        }
        elasticsearchArgument = {
            "bool": {
                "should": temp.length > 0 ? temp : {"exists": { "field": field }}
            }
        };
    }else{
        elasticsearchArgument = {
            "bool": {
                "must": [
                    {"exists": { "field": argument.treepath }},
                    {"exists": { "field": field }}
                ]
            }
        }
    }

    return elasticsearchArgument;
}

function intermediateToElasticsearchQuery(intermediateObject, results){
    var elasticsearchQuery = {
        "query": {
            "bool": {
                "should": []
            }
        }
    };

    if(intermediateObject.name == "csafApi"){
        //findDocuments-Element
        var csafApiSearch = intermediateObject.subElements.filter(e => e.name === "findDocuments");
        let i = 0;
        let generated = [];
        while (i < csafApiSearch.length) {
            generated[generated.length] = createElasticsearchQueryLoop(csafApiSearch[i], results, intermediateObject);
            i++;
        }
        elasticsearchQuery.query.bool.should = generated;
    } else {
        var undefined = true;
    }


    if(intermediateObject.max_documents){
        elasticsearchQuery["size"] = intermediateObject.max_documents;
    }else{
        elasticsearchQuery["size"] = 10;
    }

    return elasticsearchQuery;
}

module.exports = { 
    connect: Connector,
    name: elasticsearchConnector.name
};