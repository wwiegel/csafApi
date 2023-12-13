const config = require("../config");
const connector = require(config.csafIntermediate.connector);
const logger = require("../logger");
var fs = require('fs');

// document path to the original CSAF documents on the filesystem,
// read access is required for the user running the CSAF API.
const csafDocumentsPath = "./csaf-aggregator/white";

// TODO: Bind accounts as a service request.
const { accounts } = require("../data/accounts");

// Variables for GraphQL context caching
var originalContext ={}; //csafApi
var originalCsafApiFilter ={}; //csafApi
var originalCsafApiShow ={}; //csafApi

/**
 * The Intermediate is responsible for the following:
 * 1: Checking access authorization
 * 2: Manipulation of the GraphQL query
 * 2.1: caching the original context
 * 2.2: reduce the GraphQL context to a intermediate version
 * 2.3: normalizing the intermediate version of the context
 * 2.3: manipulating the response, through context manipulation
 * 2.4: and restore original context if required
 * 3: Integration of the database connector
 * 4: Including/appending original CSAF from filesystem to the response
 * @param {*} context 
 * @param {*} args 
 * @returns 
 */
function Intermediate(context, args){

    //fetch user, if user exists
    var userData = checkUser(args);

    //cache the GraphQL context, because it will be manipulated
    var alias = cacheContext(context);
    let workContext = JSON.parse(JSON.stringify(originalContext[alias]));
    //if the documents element exist, the api user wishes to see only defined elements
    if (originalCsafApiShow[alias]) {
        // remove all exept the documents element
        // in other words: replace the whole array with an one element array
        // HINWEIS: fieldNodes können mehrere sein, wenn der gleiche Alias verwendet wird.
        // Spielt aber scheinbar keine Rolle, da keine zusätzlichen Attribute gesetzt werden dürfen.
        // Und die Änderungen an dem documents Objekt werden übernommen, scheint also egal zu sein.
        // Ich verstehe den Sinn dahinter nicht, oder er ergibt sich in meinem Fall nicht.
        context.fieldNodes[0].selectionSet.selections = [originalCsafApiShow[alias]];
    } else {
        //generate manipulated query to display all elements of the response, not only the requested
        context.fieldNodes[0].selectionSet.selections = [{
            kind: "Field",
            name: { kind: "Name", value: "documents" },
            selectionSet: require('./csaf_graphql_all_possible_elements')
        }];
    }

    //The complete query is concatenated with the condition that only 
    //TLP:WHITE documents are displayed, unless the token of the 
    //requester entitles to further documents.
    workContext = authentification(workContext, userData);

    //reduce GraphQL JSON to a minimum
    var intermediateObject = createIntermediateObjectV2(workContext);
    //intermediateObject['table'] = createIntermediateObjectTable(intermediateObject);

    if(intermediateObject.originals){
        // There can also be multiple fieldNodes.
        // It makes no difference if only one fieldNode or all fieldNodes are expanded.
        // Therefore the extension is attached to the first fieldNode.
        context.fieldNodes[0].selectionSet.selections[
            context.fieldNodes[0].selectionSet.selections.length
        ]={
            kind: "Field", 
            name: {kind: "Name", value: "originalDocuments"},
            selectionSet: {kind: "SelectionSet", selections: [
                {kind: "Field", name: {kind: "Name", value: "documentName"}},
                {kind: "Field", name: {kind: "Name", value: "documentBase64Binary"}}
            ]}
        };
    }

    if(intermediateObject.metadata){
        // There can also be multiple fieldNodes.
        // It makes no difference if only one fieldNode or all fieldNodes are expanded.
        // Therefore the extension is attached to the first fieldNode.
        context.fieldNodes[0].selectionSet.selections[
            context.fieldNodes[0].selectionSet.selections.length
        ]={
            kind: "Field", 
            name: {kind: "Name", value: "metadata"},
            selectionSet: {kind: "SelectionSet", selections: [
                {kind: "Field", name: {kind: "Name", value: "total"}}
            ]}
        };
    }

    intermediateObject.max_documents = setMaxDocuments(intermediateObject);
    intermediateObject.search_arguments = getSearchArguments(intermediateObject);
    
    console.log("use connector (" + connector.name  + ")");
    return connector.connect(intermediateObject)
        .then(
            r => {
                //if an error occurs, remove documents and insert error
                if(r.error){
                    var selections = context.fieldNodes[0].selectionSet.selections;
                    selections = [{
                        kind: "Field", 
                        name: {kind: "Name", value: "error"}
                    }];
                    context.fieldNodes[0].selectionSet.selections = selections;
                } else {
                    if(intermediateObject.originals){
                        //ok, user wishes to see the original files
                        //fetch every file (results: documents.document.tracking.id)
                        r["originalDocuments"] =[];
                        let i = 0;
                        while(i < r.documents.length){
                            let documentTrackingId = r.documents[i].document.tracking.id;
                            let fileList = searchOnFilesytem(documentTrackingId, csafDocumentsPath);
                            let j = 0;
                            while (j < fileList.length){
                                r.originalDocuments[r.originalDocuments.length] = fileList[j];
                                j++;
                            }
                            i++;
                        }
                    }

                }

                return r;
            }
        )
        .catch(e => {
            console.error(e);
            logger.log("intermediate", e);
        })
    ;
}

/**
 * bypass the context
 * The findDocuments has a csafOr behavior, so all subitems are 
 * put into a csafOr. As a second condition all released TLP 
 * labels are put into a csafOr. Both conditions must be met, 
 * so these two conditions are put into a common csafAnd.
 * @param {*} context 
 * @returns 
 */
function authentification(context, userData){
    let temp = context.selectionSet.selections.filter(e => e.name.value === "findDocuments");
    if(temp.length == 0){
        context.selectionSet.selections[context.selectionSet.selections.length] = {
            "arguments":[],
            "directives":[],
            "kind": "Field",
            "name":{
                "kind": "Name",
                "value": "findDocuments"
            },
            "selectionSet": {
                "kind": "SelectionSet",
                "selections": []
            }
        };
    }
    
    var findDocuments = context.selectionSet.selections.filter(e => e.name.value === "findDocuments");
    let tlpLabelSelections = generateTlpLabelSelections(userData);
    
    let i = 0;
    while(i<findDocuments.length){
        let temp = findDocuments[i];
        let selections = temp.selectionSet.selections;
        let csafOr1 ={
            "arguments":[],
            "directives":[],
            "kind": "Field",
            "name":{
                "kind": "Name",
                "value": "csafOr"
            },
            "selectionSet": {
                "kind": "SelectionSet",
                "selections": selections
            }
        };
        let csafOr2 ={
            "arguments":[],
            "directives":[],
            "kind": "Field",
            "name":{
                "kind": "Name",
                "value": "csafOr"
            },
            "selectionSet": {
                "kind": "SelectionSet",
                "selections": tlpLabelSelections
            }
        };
        var unionSelections = [];
        if(selections.length == 0){
            unionSelections = [csafOr2];
        }
        else {
            unionSelections = [csafOr1, csafOr2];
        }
        let csafAnd ={
            "arguments":[],
            "directives":[],
            "kind": "Field",
            "name":{
                "kind": "Name",
                "value": "csafAnd"
            },
            "selectionSet": {
                "kind": "SelectionSet",
                "selections": unionSelections
            }
        };
        findDocuments[i].selectionSet.selections =[csafAnd]; 
        i++;
    }

    //case 1 is done, every findDocuments is patched: done
    //case 2 no Userdata, user has no token -> path the function generateTlpLabelSelections: done
    //case 3 no findDocuments -> insert one: done

    return context;
}

/**
 * This function generates a GraphQL query for quering tlp labes.
 * Only tlp labels were queried, the user is permitted to.
 * @param {user account information, e.g. permitted TLP label} userData 
 * @returns 
 */
function generateTlpLabelSelections(userData){
    var tlpLabelSelections_V2 = [];  

    // If user is authentified, then use the permitted TLP labels, else only default TLP label is permitted
    if(userData.authentified){
        let i = 0;
        while(i<userData.tlp_levels.length){
            tlpLabelSelections_V2[tlpLabelSelections_V2.length] = generateTlpLabelGraphqlQuery(userData.tlp_levels[i].tlpLabel);
            i++;
        }
    } else {
        tlpLabelSelections_V2[tlpLabelSelections_V2.length] = generateTlpLabelGraphqlQuery(config.csafIntermediate.defaultTLP);
    }

    return tlpLabelSelections_V2;
}

function generateTlpLabelGraphqlQuery(tlpLabel){
    // /document/distribution/tlp/label
    var tlpLabelPermission = {
        arguments:[], directives:[], kind: "Field",
        name:{ kind: "Name", value: "document" },
        selectionSet: {
            kind: "SelectionSet",
            selections: [{
                arguments:[], directives:[], kind: "Field",
                name:{ kind: "Name", value: "distribution" },
                selectionSet: {
                    kind: "SelectionSet",
                    selections: [{
                        arguments:[], directives:[], kind: "Field",
                        name:{ kind: "Name", value: "tlp" },
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [{
                                arguments:[{
                                        kind: "Argument",
                                        name: { kind: "Name",      value: "exact" },
                                        value:{ kind: "EnumValue", value: tlpLabel} 
                                }],
                                directives:[], kind: "Field",
                                name:{ kind: "Name", value: "label" }
                            }]
                        }
                    }]
                }
            }]
        }
    };
    return tlpLabelPermission;
}

function getIntermediateOriginalCsafApiFilter(){
    return originalCsafApiFilter;
}

/**
 * This function runs through the entire intermediate context by calling itself on all sub-elements.
 * Arguments are searched for because arguments are the query parameters of the front-end user, 
 * i.e. they are required for the database query.
 * @param {actual intermediate context tree node} intermediateObject 
 * @returns all found arguments found in the context
 */
function getSearchArguments(intermediateObject){
    var arguments = [];

    if(intermediateObject.subElements){
        let i = 0;
        while (i < intermediateObject.subElements.length){
            if(!intermediateObject.subElements[i]){
                logger.log("intermediate", "This case should not exist. Sub element of intermideate object does not exist.");
            }
            var temp = getSearchArguments(intermediateObject.subElements[i]);
            let j = 0;
            while(j < temp.length){
                arguments[arguments.length] = temp[j];
                j++;
            }
            i++;
        }
    }
    if(intermediateObject.arguments){
        let k = 0;
        while (k < intermediateObject.arguments.length){
            arguments[arguments.length] = intermediateObject.arguments[k];
            k++;
        }
    }

    return arguments;
}

function setMaxDocuments(intermediateObject){
    let max_documents = config.csafIntermediate.defaultMaxDocuments;

    let i = 0;
    while(i < intermediateObject.arguments.length){
        if(intermediateObject.arguments[i].name == "max_documents"){
            max_documents = intermediateObject.arguments[i].value;
        }
        i++;
    }

    return max_documents;
}

function searchOnFilesytem (documentTrackingId, csafDocumentsPath){
    var foundDocuments = [];
    var years = fs.readdirSync(csafDocumentsPath);
    let j = 0;
    while (j < years.length){
        var files = fs.readdirSync(csafDocumentsPath + "/" + years[j]);
        let k = 0;
        while(k < files.length){
            if(files[k].startsWith(documentTrackingId)){
                //bingo, found the files
                let csafFile = fs.readFileSync(csafDocumentsPath + "/" + years[j] + "/" + files[k]);
                var csafFileBase64 = Buffer.from(csafFile).toString("base64");
                foundDocuments[foundDocuments.length] = {
                    documentName: files[k],
                    documentBase64Binary: csafFileBase64
                };
            }
            k++;
        }
        j++;
    }
    return foundDocuments;
}

function createIntermediateArgument(parentRelevantsCondition, parent_treepath, argument_name, argument_value){
    var elasticsearch_path = null;
    var json_path = null;
    //if(argument_name == "path"){
    if(parent_treepath){
        json_path = "/" + parent_treepath.replace(/\./g, "/");
        elasticsearch_path = parent_treepath;
    }

    let value = argument_value;
    if(argument_name == "enum"){
        value = translateEnum(json_path, argument_value);
    }
    
    let intermediateArgument = {
        "json_path": json_path,
        "elasticsearch_path": elasticsearch_path,
        "treepath": parent_treepath ? parent_treepath : argument_name,
        "relevantsCondition": parentRelevantsCondition,
        "name": argument_name,
        "value": value,
        [argument_name]: argument_value
    }

    return intermediateArgument;
}


function createIntermediateArguments(argumentsArray, parent){
    var intermediateArguments =[];
    var parent_treepath = parent.treepath;

    let i = 0;
    while (i < argumentsArray.length){
        if(argumentsArray[i].value.value){
            intermediateArguments[intermediateArguments.length] = 
            createIntermediateArgument(parent.relevantsCondition, parent_treepath, argumentsArray[i].name.value, argumentsArray[i].value.value);
        }else{
            let j = 0;
            while(j < argumentsArray[i].value.values.length){
                intermediateArguments[intermediateArguments.length] = 
                    createIntermediateArgument(parent.relevantsCondition, parent_treepath, argumentsArray[i].name.value, argumentsArray[i].value.values[j].value);
                j++;
            }
        }
        i++;
    }

    //API8:2019 - Injection
    intermediateArguments = pathValidation(intermediateArguments);

    return intermediateArguments;
}

function createIntermediateSubElements(subElementsArray, parent){
    var intermediateSubElements = [];

    let i = 0;
    while (i < subElementsArray.length){
        intermediateSubElements[intermediateSubElements.length] = createIntermediateObject(subElementsArray[i], parent);
        i++;
    }

    return intermediateSubElements;
}

function createIntermediateObjectV2(graphQlContext, parent){
    var intermediateObject = createIntermediateObject(graphQlContext, parent);

    let i = 0;
    while(i < intermediateObject.arguments.length){
        intermediateObject[[intermediateObject.arguments[i].name]] = intermediateObject.arguments[i].value
        i++;
    }

    // special case: attribute "originals" isn't set, 
    // but "originalDocuments" was queried
    let originalDocuments = graphQlContext.selectionSet.selections.filter(e => e.name.value === "originalDocuments");
    if(originalDocuments.length > 0){
        intermediateObject["originals"] = true;
    }

    return intermediateObject;
}

function createExistArray(object){
    var existArray = [];

    if (object.selectionSet && object.selectionSet.selections) {
        let i = 0;
        while(i < object.selectionSet.selections.length){
            var temp = createExistArray(object.selectionSet.selections[i]);
            let j =0;
            while (j <temp.length){
                if(object.name.value != "exist"){
                    existArray[existArray.length] = "/" + object.name.value + temp[j];
                }else{
                    existArray[existArray.length] = temp[j];
                }
                j++;
            }
            i++;
        }
    } else {
        existArray[existArray.length] = "/" + object.name.value;
    }

    return existArray;
}

function pathValidation(paths){
    var validPaths = [];

    let i = 0;
    while(i<paths.length){
        if(paths[i].name == "path"){
            // TODO: The list of valid paths is not complete
            // paths like "/document/title" are valid, but could be reached by using the normal exist funcionallity, 
            // because they are leafs at the CSAF tree. 
            // existp functionallity was added for paths which are nodes (no leafs) and could not reached else where.
            if(
                paths[i].path == "/document" ||
                paths[i].path == "/document/acknowledgments" ||
                paths[i].path == "/document/aggregate_severity" ||
                //paths[i].path == "/document/category" ||
                //paths[i].path == "/document/csaf_version" ||
                paths[i].path == "/document/distribution" ||
                //paths[i].path == "/document/lang" ||
                paths[i].path == "/document/notes" ||
                paths[i].path == "/document/publisher" ||
                paths[i].path == "/document/references" ||
                //paths[i].path == "/document/source_lang" ||
                // paths[i].path == "/document/title" ||
                paths[i].path == "/document/tracking" ||
                paths[i].path == "/document/tracking/revision_history/date" ||
                paths[i].path == "/document/lang" ||
                paths[i].path == "/product_tree" ||
                paths[i].path == "/product_tree/branches" ||
                paths[i].path == "/product_tree/branches/branches" ||
                paths[i].path == "/product_tree/branches/branches/branches" ||
                paths[i].path == "/product_tree/branches/branches/branches/branches" ||
                paths[i].path == "/product_tree/branches/branches/branches/branches/branches" ||
                paths[i].path == "/product_tree/full_product_names" ||
                paths[i].path == "/vulnerabilities" ||
                paths[i].path == "/vulnerabilities/cwe" ||
                paths[i].path == "/vulnerabilities/references" ||
                paths[i].path == "/vulnerabilities/remediations/category" ||
                paths[i].path == "/vulnerabilities/scores" ||
                paths[i].path == "/vulnerabilities/scores/products" ||
                paths[i].path == "/vulnerabilities/threats"
                
            ){
                validPaths[validPaths.length] = paths[i]; 
            } else {
                logger.log("intermediate", "OWASP:API8:2019 - existp path is not valid or not permitted: " + paths[i].path);
                //console.error("API8:2019 - Injection or unvalid path ###  path = " + paths[i].path);

                // because the path is not valid, set a default valid path
                paths[i].path = "/document";
                paths[i].value = "/document";
                validPaths[validPaths.length] = paths[i]; 
            } 
        } else {
            // it is not a path argument, ignore it, it is an other argument
            validPaths[validPaths.length] = paths[i]; 
        } 
        i++;
    } 

    return validPaths; 
}

function createExistpArguments(graphQlContext){
    let newExistpArguments = [];

    let paths = createExistArray (graphQlContext);
    let i = 0;
    while(i < paths.length){
        newExistpArguments[newExistpArguments.length] = {
            block: false,
            kind: "StringValue",
            value: paths[i],
        };
        i++;
    }

    return newExistpArguments;
}

/**
 * remove equivalences
 * @param {*} intermediateObject 
 * @param {*} graphQlContext 
 * @returns 
 */
function harmonizeIntermediateObjects(intermediateObject, graphQlContext){
    if(intermediateObject.name == "must")    {intermediateObject.name = "csafAnd";}
    if(intermediateObject.name == "must_not"){intermediateObject.name = "csafNot";}
    if(intermediateObject.name == "should")  {intermediateObject.name = "csafOr";}

    if(intermediateObject.name == "exist"){
        intermediateObject.name = "existp";
        //The arguments are only generated later in the process,
        //Therefore the GraphQL context must be manipulated here,
        //so that the correct attributes are generated from it
        let newExistpArguments = createExistpArguments(graphQlContext);
        graphQlContext.arguments[graphQlContext.arguments.length] ={
            kind: "Argument",
            name:{
                kind: "Name",
                value: "path"
            },
            value:{
                kind: "ListValue",
                values: newExistpArguments
            } 
        };
        //remove the tree branch, because the attributes (existp) replaces the tree branch
        delete graphQlContext.selectionSet;
    }

    return intermediateObject;
}

function createIntermediateObject2(path, name, relevantsCondition){
    var intermediateObject = {
        elasticsearch_path: path,
        json_path:          "/" + path.replace(/\./g, "/"),
        name:               name,
        relevantsCondition: relevantsCondition,
        treepath:           path,
        arguments:          [],
        subElements:        []
    };
    return intermediateObject;
}

function prefixPathOfSubElements(subElements, path){
    let i = 0;
    while (i < subElements.length){
        subElements[i].treepath = path + "." + subElements[i].treepath;
        subElements[i].json_path = "/" + subElements[i].treepath.replace(/\./g, "/");
        subElements[i].elasticsearch_path = subElements[i].treepath;
        if(subElements[i].subElements && subElements[i].subElements.length > 0){
            subElements[i].subElements = prefixPathOfSubElements(JSON.parse(JSON.stringify(subElements[i].subElements)), subElements[i].path + "." + path);
        }
        if(subElements[i].arguments){
            let j = 0;
            while(j < subElements[i].arguments.length){
                subElements[i].arguments[j].treepath = path + "." + subElements[i].arguments[j].treepath;
                subElements[i].arguments[j].json_path = "/" + subElements[i].arguments[j].treepath.replace(/\./g, "/");
                subElements[i].arguments[j].elasticsearch_path = subElements[i].arguments[j].treepath;
                j++;
            }
        }
        i++;
    }
    return subElements;
}

function createByProductProductTreeBranches_V2 (intermediateObject, i){
    var tempIntermediateObject = JSON.parse(JSON.stringify(intermediateObject));
    var path = "product_tree";
    var intermediateObject1 = createIntermediateObject2(path, "product_tree", intermediateObject.relevantsCondition);
    path = "product_tree.branches";
    var intermediateObject2 = createIntermediateObject2(path, "branches", intermediateObject1.relevantsCondition);
    intermediateObject1.subElements[intermediateObject1.subElements.length] = intermediateObject2;

    let j = 0;
    var intermediateObjectTemp1 = intermediateObject2;
    while(j < i){
        path += ".branches";
        var intermediateObjectTemp2 = createIntermediateObject2(path, "branches", intermediateObject1.relevantsCondition);
        intermediateObjectTemp1.subElements[intermediateObjectTemp1.subElements.length] = intermediateObjectTemp2;
        intermediateObjectTemp1 = intermediateObjectTemp2;
        j++;
    }
    path += ".product";
    var intermediateObject4 = createIntermediateObject2(path, "product", intermediateObjectTemp1.relevantsCondition);
    intermediateObjectTemp1.subElements[intermediateObjectTemp1.subElements.length] = intermediateObject4;

    //prefix the path of the searchParameter
    intermediateObject4.subElements = prefixPathOfSubElements(JSON.parse(JSON.stringify(intermediateObject.subElements)), path);

    tempIntermediateObject.subElements = [
        intermediateObject1
    ];
    
    return tempIntermediateObject;
}

function createByProductProductTreeFullProductNames (intermediateObject){
    var tempIntermediateObject = JSON.parse(JSON.stringify(intermediateObject));
    var path = "product_tree";
    var intermediateObject1 = createIntermediateObject2(path, "product_tree", intermediateObject.relevantsCondition);
    path = "product_tree.full_product_names";
    var intermediateObject2 = createIntermediateObject2(path, "full_product_names", intermediateObject1.relevantsCondition);
    intermediateObject1.subElements[intermediateObject1.subElements.length] = intermediateObject2;
    var intermediateObjectTemp1 = intermediateObject2;

    //prefix the path of the searchParameter
    intermediateObjectTemp1.subElements = prefixPathOfSubElements(JSON.parse(JSON.stringify(intermediateObject.subElements)), path);

    tempIntermediateObject.subElements = [
        intermediateObject1
    ];
    
    return tempIntermediateObject;
}

function createByProductProductTreeRelationshipsFullProductName (intermediateObject){
    var tempIntermediateObject = JSON.parse(JSON.stringify(intermediateObject));
    var path = "product_tree";
    var intermediateObject1 = createIntermediateObject2(path, "product_tree", intermediateObject.relevantsCondition);
    path = "product_tree.relationships";
    var intermediateObject2 = createIntermediateObject2(path, "relationships", intermediateObject1.relevantsCondition);
    intermediateObject1.subElements[intermediateObject1.subElements.length] = intermediateObject2;
    path = "product_tree.relationships.full_product_name";
    var intermediateObject3 = createIntermediateObject2(path, "full_product_name", intermediateObject2.relevantsCondition);
    intermediateObject2.subElements[intermediateObject2.subElements.length] = intermediateObject3;

    //prefix the path of the searchParameter
    intermediateObject3.subElements = prefixPathOfSubElements(JSON.parse(JSON.stringify(intermediateObject.subElements)), path);

    tempIntermediateObject.subElements = [
        intermediateObject1
    ];
    
    return tempIntermediateObject;
}

function createIntermediateByProductObject(graphQlContext, parent){
    var tempgraphQlContext = JSON.parse(JSON.stringify(graphQlContext));
    tempgraphQlContext.name.value = "csafOr";
    var tempIntermediateObject = createIntermediateObject(tempgraphQlContext, parent);
    

    var tempSubElements = [];

    //product_tree.branches
    //product_tree.branches.branches
    //product_tree.branches.branches.branches
    //product_tree.branches.branches.branches.branches
    let i = 0;
    while(i < config.csafIntermediate.branchesMaxDepth){
        tempSubElements[tempSubElements.length] = createByProductProductTreeBranches_V2(tempIntermediateObject, i);
        //tempSubElements[tempSubElements.length] = createByProductProductTreeBranches(tempSearchparameter, i);
        i++;
    }
    //product_tree.full_product_names
    tempSubElements[tempSubElements.length] = createByProductProductTreeFullProductNames(tempIntermediateObject);
    //product_tree.relationships.full_product_names
    tempSubElements[tempSubElements.length] = createByProductProductTreeRelationshipsFullProductName(tempIntermediateObject);

    /*var intermediateByProductObject = {
        arguments: [],
        alias: tempIntermediateObject.alias,
        elasticsearch_path: tempIntermediateObject.elasticsearch_path,
        json_path: tempIntermediateObject.json_path,
        name: "csafOr",
        relevantsCondition: tempIntermediateObject.relevantsCondition,
        treepath: tempIntermediateObject.treepath,
        subElements: tempSubElements
    };*/

    return tempSubElements;
}

function generateGraphqlContextFromJsonPath(jsonpath){
    var newGraphqlObject = {};

    const myArray = jsonpath.split("/");
    if(myArray.length>1){

    }

    return newGraphqlObject;
}

function harmonizeExistp(graphQlContext){
    var paths = [];
    let tempPaths = graphQlContext.arguments.filter(e => e.name.value === "path");
    let i = 0;
    while(i<tempPaths.length){
        paths[paths.length] = tempPaths[i].value.value;
        i++;
    }

    //generate selectionSet
    graphQlContext["selectionSet"] ={
        "kind": "SelectionSet",
        "selections": []
    };
    var selections = graphQlContext.selectionSet.selections;
    let j = 0;
    while(j<paths.length){
        selections[selections.length] = generateGraphqlContextFromJsonPath(paths[j]);
        j++;
    }

    //change root (existp -> exist)
    graphQlContext.arguments = [];
    graphQlContext.name.value = "exist";

    return graphQlContext;
};

function createIntermediateObject(graphQlContext, parent){
    var intermediateObject = {};

    /*
    Im Moment darf ich nicht weiter programmieren, muss schreiben,
    daher ist der Ansatz auskommentiert.

    //harmonize existp before intermediate translation
    if(
        graphQlContext.name.value == "existp"
    ){ 
        graphQlContext = harmonizeExistp(graphQlContext);
    }*/

    var parent_treepath = parent ? parent.treepath : null;
    var parent_relevantsCondition = parent ? parent.relevantsCondition : null;

    intermediateObject.name = graphQlContext.name ? graphQlContext.name.value : null;
    intermediateObject.alias = graphQlContext.alias ? graphQlContext.alias.value : intermediateObject.name;
    intermediateObject.treepath = parent_treepath ? parent_treepath + "." + intermediateObject.name : intermediateObject.name;
    intermediateObject.elasticsearch_path = parent_treepath ? parent_treepath + "." + intermediateObject.name : intermediateObject.name;
    intermediateObject.json_path = parent_treepath ? "/" + parent_treepath.replace(/\./g, "/") + "/" + intermediateObject.name : "/" + intermediateObject.name;

    if(
        intermediateObject.treepath == "csafApi" ||
        intermediateObject.treepath == "findDocuments" ||
        intermediateObject.treepath == "csafAnd" ||
        intermediateObject.treepath == "csafOr" ||
        intermediateObject.treepath == "csafNot" ||
        intermediateObject.treepath == "must" ||
        intermediateObject.treepath == "should" ||
        intermediateObject.treepath == "must_not" ||
        intermediateObject.treepath == "exist" ||
        intermediateObject.treepath == "existp" ||
        intermediateObject.treepath == "csafXor" ||
        intermediateObject.treepath == "byProduct"
    ){ 
        intermediateObject.treepath = null;
        intermediateObject.json_path = null;
        intermediateObject.elasticsearch_path = null;
    }


    if(intermediateObject.treepath == "findDocuments"){
        intermediateObject.relevantsCondition = "must";
    };

    if(
        intermediateObject.treepath == "csafAnd" ||
        intermediateObject.treepath == "csafOr" ||
        intermediateObject.treepath == "must" ||
        intermediateObject.treepath == "should" ||
        intermediateObject.treepath == "exist" ||
        intermediateObject.treepath == "existp" ||
        !intermediateObject.relevantsCondition
    ) { 
        intermediateObject.relevantsCondition = parent_relevantsCondition; 
    };

    if(
        intermediateObject.treepath == "csafNot" ||
        intermediateObject.treepath == "must_not"
    ) { 
        if(parent.relevantsCondition == "must") {intermediateObject.relevantsCondition = "must_not";}
        else {intermediateObject.relevantsCondition = "must";}
    };

    if(intermediateObject.name == "byProduct"){
        intermediateObject.name = "csafOr";
        intermediateObject.subElements = createIntermediateByProductObject(graphQlContext, parent);
    }else{
        
        //remove equivalences
        intermediateObject = harmonizeIntermediateObjects(intermediateObject, graphQlContext);
        
        intermediateObject.subElements = graphQlContext.selectionSet ? createIntermediateSubElements(graphQlContext.selectionSet.selections, intermediateObject) : null;
    }
    
    intermediateObject.arguments = graphQlContext.arguments ? createIntermediateArguments(graphQlContext.arguments, intermediateObject) : null;
 
    return intermediateObject;
}

/**
 * This function gets the current GraphQL context. 
 * If the context is unmanipulated, if it is the original context, 
 * then it is cached under the alias of the query.
 * @param {actual given context} context 
 * @returns the alias of the query
 */
function cacheContext(context){
    //csafAPI part of the context
    var contextCsafApi = context.fieldNodes[0];
    // If an alias is assigned, then take the alias 
    // otherwise take the name of the query
    var tempAlias = contextCsafApi.alias ? contextCsafApi.alias.value : contextCsafApi.name.value;

    //if element is missing, than the context is manipulated by CSAF API;
    if (!contextCsafApi.manipulated) {
        originalContext[tempAlias] = JSON.parse(JSON.stringify(contextCsafApi));
        var apiParts = originalContext[tempAlias].selectionSet.selections;
        //search
        //var csafApiSearch = apiParts.filter(e => e.name.value === "searchParameter")[0];
        //filter
        var csafApiFilter = apiParts.filter(e => e.name.value === "filterParameter")[0];
        //show
        var csafApiShow = apiParts.filter(e => e.name.value === "documents")[0];

        //if (csafApiSearch) {
            //originalCsafApiSearch[tempAlias] = JSON.parse(JSON.stringify(csafApiSearch));
        //}
        if (csafApiFilter) {
            originalCsafApiFilter[tempAlias] = JSON.parse(JSON.stringify(csafApiFilter));
        }
        if (csafApiShow) {
            originalCsafApiShow[tempAlias] = JSON.parse(JSON.stringify(csafApiShow));
        }

        //mark this context as CSAF API manipulated
        //delete contextCsafApi.loc;
        contextCsafApi["manipulated"] = true;
    } else {
        //query is graphql unchanged (it is the manipulated one), 
        //don't cache the manipulated query as original
    }
    
    return tempAlias;
}

function checkUser(args){
    var token = args.token ? args.token : "";

    // TODO: rename to permitted tlp label: permitted_tlp_label
    var tlp_levels = [];
    var authentified = false;
    var account = {};
    let i = 0;
    if (token.length > 0) {
        while (i < accounts.length) {
            if (accounts[i].token == token) {
                account = accounts[i];
                tlp_levels = account.permissions;
                authentified = true;
                i = accounts.length;
            }
            i++;
        }

        // API10:2019 Insufficient Logging & Monitoring
        // Unknown tokens can be logged as an attack attempt.
        if (!authentified && token.length > 0) {
            //Logging
            logger.log("intermediate", "OWASP:API10:2019 - Token does not exist: " + token);
        }
    }

    return {
        token: token,
        tlp_levels: tlp_levels,
        authentified: authentified,
        account: account
    };
}

/**
 * 
 * @param {CSAF document path} json_path 
 * @param {Enumeration in UPPER_CASE} argument_value 
 * @returns 
 */
function translateEnum(json_path, argument_value){
    let translatedEnum = "";
    let tempJsonPath = "";
    var tempArray = json_path.split("/");
    let i = tempArray.length-2;
    while(i < tempArray.length){
        if(i!=0){
            tempJsonPath += "/" + tempArray[i];
        }
        i++;
    }
    if(tempJsonPath == "/branches/category") {
        // /product_tree/branches*/category
        if      (argument_value == "ARCHITECTURE")          {translatedEnum = "architecture";}
        else if (argument_value == "HOST_NAME")             {translatedEnum = "host_name";}
        else if (argument_value == "LANGUAGE")              {translatedEnum = "language";}
        else if (argument_value == "LEGACY")                {translatedEnum = "legacy";}
        else if (argument_value == "PATCH_LEVEL")           {translatedEnum = "patch_level";}
        else if (argument_value == "PRODUCT_FAMILY")        {translatedEnum = "product_family";}
        else if (argument_value == "PRODUCT_NAME")          {translatedEnum = "product_name";}
        else if (argument_value == "PRODUCT_VERSION")       {translatedEnum = "product_version";}
        else if (argument_value == "PRODUCT_VERSION_RANGE") {translatedEnum = "product_version_range";}
        else if (argument_value == "SERVICE_PACK")          {translatedEnum = "service_pack";}
        else if (argument_value == "SPECIFICATION")         {translatedEnum = "specification";}
        else if (argument_value == "VENDOR")                {translatedEnum = "vendor";}
        else                                                {translatedEnum = "csafUndefined"}
    }else if(tempJsonPath == "/notes/category") {
        // /vulnerabilities/notes/category
        if      (argument_value == "DESCRIPTION")      {translatedEnum = "description";}
        else if (argument_value == "DETAILS")          {translatedEnum = "details";}
        else if (argument_value == "FAQ")              {translatedEnum = "faq";}
        else if (argument_value == "GENERAL")          {translatedEnum = "general";}
        else if (argument_value == "LEGAL_DISCLAIMER") {translatedEnum = "legal_disclaimer";}
        else if (argument_value == "OTHER")            {translatedEnum = "other";}
        else if (argument_value == "SUMMARY")          {translatedEnum = "summary";}
        else                                           {translatedEnum = "csafUndefined"}
    }else if(tempJsonPath == "/references/category") {
        // /document/references/category
        if      (argument_value == "EXTERNAL")      {translatedEnum = "external";}
        else if (argument_value == "SELF")          {translatedEnum = "self";}
        else                                           {translatedEnum = "csafUndefined"}
    }else if(tempJsonPath == "/document/csaf_version") {
        if      (argument_value == "V2_0")          {translatedEnum = "2.0";}
        else                                           {translatedEnum = "csafUndefined"}
    }else if(tempJsonPath == "/publisher/category") {
        // /document/publisher/category
        if      (argument_value == "COORDINATOR")      {translatedEnum = "coordinator";}
        else if (argument_value == "DISCOVERER")          {translatedEnum = "discoverer";}
        else if (argument_value == "OTHER")          {translatedEnum = "other";}
        else if (argument_value == "TRANSLATOR")          {translatedEnum = "translator";}
        else if (argument_value == "USER")          {translatedEnum = "user";}
        else if (argument_value == "VENDOR")          {translatedEnum = "vendor";}
        else                                           {translatedEnum = "csafUndefined"}
    }else if(tempJsonPath == "/tracking/status") {
        // /document/tracking/status
        if      (argument_value == "DRAFT")      {translatedEnum = "draft";}
        else if (argument_value == "FINAL")          {translatedEnum = "final";}
        else if (argument_value == "INTERIM")          {translatedEnum = "interim";}
        else                                           {translatedEnum = "csafUndefined"}
    }else if(tempJsonPath == "/relationships/category") {
        // /product_tree/relationships[ ]/category
        if      (argument_value == "DEFAULT_COMPONENT_OF")      {translatedEnum = "default_component_of";}
        else if (argument_value == "EXTERNAL_COMPONENT_OF")          {translatedEnum = "external_component_of";}
        else if (argument_value == "INSTALLED_ON")          {translatedEnum = "installed_on";}
        else if (argument_value == "INSTALLED_WITH")          {translatedEnum = "installed_with";}
        else if (argument_value == "OPTIONAL_COMPONENT_OF")          {translatedEnum = "optional_component_of";}
        else                                           {translatedEnum = "csafUndefined"}
    }else if(tempJsonPath == "/flags/label") {
        // vulnerabilities[ ]/flags[ ]/label 
        if      (argument_value == "COMPONENT_NOT_PRESENT")      {translatedEnum = "component_not_present";}
        else if (argument_value == "INLINE_MITIGATION_ALREADY_EXIST")          {translatedEnum = "inline_mitigations_already_exist";}
        else if (argument_value == "VULNERABLE_CODE_CANNOT_BE_CONTROLLED_BY_ADVERSARY")          {translatedEnum = "vulnerable_code_cannot_be_controlled_by_adversary";}
        else if (argument_value == "VULNERABLE_CODE_NOT_IN_EXECUTE_PATH")          {translatedEnum = "vulnerable_code_not_in_execute_path";}
        else if (argument_value == "VULNERABLE_CODE_NOT_PRESENT")          {translatedEnum = "vulnerable_code_not_present";}
        else                                           {translatedEnum = "csafUndefined"}
    }else if(tempJsonPath == "/involvements/party") {
        // /vulnerabilities[ ]/involvements[ ]/party 
        if      (argument_value == "COORDINATOR")      {translatedEnum = "coordinator";}
        else if (argument_value == "DISCOVERER")          {translatedEnum = "discoverer";}
        else if (argument_value == "OTHER")          {translatedEnum = "other";}
        else if (argument_value == "USER")          {translatedEnum = "user";}
        else if (argument_value == "VENDOR")          {translatedEnum = "vendor";}
        else                                           {translatedEnum = "csafUndefined"}
    }else if(tempJsonPath == "/involvements/status") {
        // /vulnerabilities[ ]/involvements[ ]/status 
        if      (argument_value == "COMPLETED")      {translatedEnum = "completed";}
        else if (argument_value == "CONTACT_ATTEMPTED")          {translatedEnum = "contact_attempted";}
        else if (argument_value == "DISPUTED")          {translatedEnum = "disputed";}
        else if (argument_value == "IN_PROGRESS")          {translatedEnum = "in_progress";}
        else if (argument_value == "NOT_CONTACTED")          {translatedEnum = "not_contacted";}
        else if (argument_value == "OPEN")          {translatedEnum = "open";}
        else                                           {translatedEnum = "csafUndefined"}
    }else if(tempJsonPath == "/remediations/category") {
        // /vulnerabilities[ ]/remediations[ ]/category 
        if      (argument_value == "MITIGATION")      {translatedEnum = "mitigation";}
        else if (argument_value == "NO_FIX_PLANNED")          {translatedEnum = "no_fix_planned";}
        else if (argument_value == "NONE_AVAILABLE")          {translatedEnum = "none_available";}
        else if (argument_value == "VENDOR_FIX")          {translatedEnum = "vendor_fix";}
        else if (argument_value == "WORKAROUND")          {translatedEnum = "workaround";}
        else                                           {translatedEnum = "csafUndefined"}
    }else if(tempJsonPath == "/restart_required/category") {
        // /vulnerabilities[ ]/remediations[ ]/restart_required/category 
        if      (argument_value == "CONNECTED")            {translatedEnum = "connected";}
        else if (argument_value == "DEPENDENCIES")         {translatedEnum = "dependencies";}
        else if (argument_value == "MACHINE")              {translatedEnum = "machine";}
        else if (argument_value == "NONE")                 {translatedEnum = "none";}
        else if (argument_value == "PARENT")               {translatedEnum = "parent";}
        else if (argument_value == "SERVICE")              {translatedEnum = "service";}
        else if (argument_value == "SYSTEM")               {translatedEnum = "system";}
        else if (argument_value == "VULNERABLE_COMPONENT") {translatedEnum = "vulnerable_component";}
        else if (argument_value == "ZONE")                 {translatedEnum = "zone";}
        else                                               {translatedEnum = "csafUndefined"}
    }else if(tempJsonPath == "/threats/category") {
        // /vulnerabilities[ ]/threats[ ]/category
        if      (argument_value == "EXPLOIT_STATUS")       {translatedEnum = "exploit_status";}
        else if (argument_value == "IMPACT")               {translatedEnum = "impact";}
        else if (argument_value == "TARGET_SET")           {translatedEnum = "target_set";}
        else                                               {translatedEnum = "csafUndefined"}
    }else {
        //no translation, use it as it is
        translatedEnum = argument_value;
    }

    return translatedEnum;
}

module.exports = { 
    Intermediate,
    getIntermediateOriginalCsafApiFilter
};