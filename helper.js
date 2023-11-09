class helper {
    helper(){
        //this.name = name;
        //this.color = color; 
        //this.price = price;
    }


    getFilter_V2(context){
        var returnFilter = context;

        if(returnFilter){
            returnFilter = searchFilter_V2(context);
        }

        return returnFilter;
    }

    extendedFilter(array, filteredArrayPath, referenceId){
        /* TODO: 
            1.  suche alle searchParameter zur referenceId
            2.  suche alle Referenzen passend zu den Suchparametern
            3.  filtere alle Elemente aus dem array, 
                die zu keiner Referenz passen
        */
        return array;
    }


    isFilterVulnerabilitiesProductStatusOnProductTreeFullProductNamesProductId(context, originalContext){
        var tempAlias = searchQueryName(context.path);
        var csafApiFilter = originalContext[tempAlias];

        var is = false;
        //at the moment it is the only extended filter
        //it is enough to check only for the existance of an extendedFilter
        //once there are more, check for the right name of the extendedFilter (a SelectionSet deeper)
        var relevat = csafApiFilter.selectionSet.selections.filter(e => e.name.value === "extendedFilter");
        is = relevat ? true : false;

        return true;
    }

    /**
     * This function gets an array and returns a filtered array. Filters can be present for subelements of arrays. 
     * If a filter is present, then filtering is done, otherwise the array remains unchanged.
     * @param {*} context is the CSAF document part, translated to GraphQL, which is to be filtered
     * @param {*} array is the array to be filtered
     * @param {*} originalCsafApiFilter is the Filter cached from the GraphQL query as GraphQL context part
     * @param {*} csafPath is the CSAF JSON path to the array
     * @param {*} arrayName is the sub-element of the array on the basis of which filtering is performed if a filter has been set for it
     * @returns 
     */
    filterArray_V2(context, array, originalCsafApiFilter, csafPath, arrayName){
        var filteredArray = array;

        var filterName = arrayName;
        var tempAlias = searchQueryName(context.path);
        var csafApiFilter = originalCsafApiFilter[tempAlias];

        if(csafApiFilter){
            var temp_filter = graphQLhelper.getFilter_V2(csafApiFilter);
            var relevantFilter = temp_filter.filter(e => e.csafPath === (csafPath + "/" + arrayName));
    
            var deleteItem = true;
            if(relevantFilter.length >0){
                /*var csafPathType = "String";
                if(csafPathType == "String"){
                    filteredArray = filterArrayString(filteredArray);
                }else{
                    filteredArray = filterArrayDate(filteredArray);
                }*/

                var relevantMustNotFilter = relevantFilter.filter(e => e.parameterName === "must_not");
                let rmn_i = 0;
                while(rmn_i < relevantMustNotFilter.length){
                    let tn_i = 0;
                    while(tn_i < filteredArray.length){
                        var tempArrayString = filteredArray[tn_i][[filterName]] ? filteredArray[tn_i][[filterName]] : "";
                        var tempFilterString = relevantFilter[rmn_i].parameterValue;
                        if(tempArrayString.includes(tempFilterString)){
                            filteredArray.splice(tn_i, 1);
                        }else{
                            tn_i++;
                        }
                    }
                    rmn_i++;
                }
                var relevantMustFilter = relevantFilter.filter(e => e.parameterName === "must");
                let tn_i = 0;
                while(tn_i < filteredArray.length && relevantMustFilter.length > 0){
                    deleteItem = true;
                    let rm_i = 0;
                    while(rm_i < relevantMustFilter.length){
                        var tempArrayString = filteredArray[tn_i][[filterName]] ? filteredArray[tn_i][[filterName]] : "";
                        var tempFilterString = relevantFilter[rm_i].parameterValue;
                        if(tempArrayString.includes(tempFilterString)){
                            deleteItem = false;
                        }
                        rm_i++;
                    }
                    if(deleteItem){
                        filteredArray.splice(tn_i, 1);
                    }else{
                        tn_i++;
                    }
                }
                var relevantYoungerFilter = relevantFilter.filter(e => e.parameterName === "younger");
                let rm_i = 0;
                while(rm_i < relevantYoungerFilter.length){
                    let ryf_i = 0;
                    while(ryf_i < filteredArray.length && relevantYoungerFilter.length > 0){
                        var tempArrayString = filteredArray[ryf_i][[filterName]] ? filteredArray[ryf_i][[filterName]] : "2000-01-01";
                        var tempFilterString = relevantYoungerFilter[rm_i].parameterValue;
                        if(tempArrayString <= tempFilterString){
                            filteredArray.splice(ryf_i, 1);
                        }else{
                            ryf_i++;
                        }
                    }
                    rm_i++;
                }
                var relevantOlderFilter = relevantFilter.filter(e => e.parameterName === "older");
                let ro_i = 0;
                while(ro_i < relevantOlderFilter.length){
                    let rof_i = 0;
                    while(rof_i < filteredArray.length && relevantOlderFilter.length > 0){
                        var tempArrayString = filteredArray[rof_i][[filterName]] ? filteredArray[rof_i][[filterName]] : "2000-01-01";
                        var tempFilterString = relevantOlderFilter[ro_i].parameterValue;
                        if(tempArrayString >= tempFilterString){
                            filteredArray.splice(rof_i, 1);
                        }else{
                            rof_i++;
                        }
                    }
                    ro_i++;
                }
            }
        }

        return filteredArray;
    }
}

/**
 * 
 * This function walks the tree structure from the leaf to the root node 
 * and concatenates the individual nodes with a dot, resulting in a Elasticsearch path.
 * 
 * @param {*} context_path ist the path attribute of a GraphQL context 
 * root
 *   node1
 *     node2
 *       leaf
 * 
 * @returns the GraphQL tree path as Elasticsearch path
 * root.node1.node2.leaf
 * 
 * Nodes that do not belong to CSAF are ignored:
 * Query, csafApiPlatypus
 * 
 * Nodes that act as array layer are ignored:
 * context_path.typename: undefined
 * 
 */
function constructPath(path){
    var tempPath = "";
    
    if(path.prev){
        tempPath = constructPath(path.prev);
    }

    if(!path.typename){
        //do nothoing
    }else if(path.typename == "Query"){
        //do nothoing
    //}else if(path.typename == "csafDocument"){
        //do nothoing
    }else if(path.typename == "csafApiPlatypus"){
        //do nothoing
    }else if(tempPath.length == 0){
        tempPath = path.key;
    }else{
        tempPath += "." + path.key;
    }

    return tempPath;
}

function searchQueryName(path){
    var tempQueryName = "";
    if(path.prev){
        tempQueryName = searchQueryName(path.prev);
    }else{
        tempQueryName = path.key;
    }
    return tempQueryName;
}

function searchFilter(context){
    var temp_filter = [];
    let i = 0;
    if(context.selectionSet){
        while(i < context.selectionSet.selections.length){
            var temp_filter2 = searchFilter(context.selectionSet.selections[i], "parameter");
            let j = 0;
            while(j < temp_filter2.length){
                var tempParameterName = temp_filter2[j].parameterName;
                if(tempParameterName == "should" && (context.name.value == "must" || context.name.value == "must_not")){
                    tempParameterName = context.name.value;
                }
                if(tempParameterName == "younger" && context.name.value == "must_not"){
                    tempParameterName = "older";
                }
                if(tempParameterName == "older" && context.name.value == "must_not"){
                    tempParameterName = "younger";
                }

                var tempCasfPath = temp_filter2[j].csafPath;
                if(context.name.value != "must" && context.name.value != "should" && context.name.value != "must_not" && context.name.value != "filterParameter"){
                    tempCasfPath = context.name.value + "." + temp_filter2[j].csafPath;
                }
                temp_filter.push({
                    name: context.name.value + "." + temp_filter2[j].name,
                    parameterValue: temp_filter2[j].parameterValue,
                    parameterName: tempParameterName,
                    parameterNameOld: temp_filter2[j].parameterNameOld,
                    csafPath: tempCasfPath,
                    csafType: temp_filter2[j].csafType
                });

                j++;
            }
            i++;
        }
    }else{
        if(context.arguments){
            let k = 0;
            while(k < context.arguments.length){
                var tempParameterName = context.arguments[0].name.value;
                var tempType = "string";
                if(tempParameterName == "exact"){
                    tempParameterName = "must";
                }
                if(tempParameterName == "younger" || tempParameterName == "older"){
                    tempType = "date";
                }
                temp_filter.push({
                    name: context.name.value,
                    parameterValue: context.arguments[0].value.value,
                    parameterName: tempParameterName,
                    parameterNameOld: context.arguments[0].name.value,
                    csafPath: context.name.value,
                    csafType: tempType
                });
                k++;
            }
        }
    }
    return temp_filter;
}

function searchFilter_V2(context){
    var temp_filter = [];
    let i = 0;
    if(context.selectionSet){
        while(i < context.selectionSet.selections.length){
            var temp_filter2 = searchFilter_V2(context.selectionSet.selections[i], "parameter");
            let j = 0;
            while(j < temp_filter2.length){
                var tempParameterName = temp_filter2[j].parameterName;
                if(tempParameterName == "should" && (context.name.value == "must" || context.name.value == "must_not")){
                    tempParameterName = context.name.value;
                }
                if(tempParameterName == "younger" && context.name.value == "must_not"){
                    tempParameterName = "older";
                }
                if(tempParameterName == "older" && context.name.value == "must_not"){
                    tempParameterName = "younger";
                }

                var tempCasfPath = temp_filter2[j].csafPath;
                if(context.name.value != "must" && context.name.value != "should" && context.name.value != "must_not" && context.name.value != "filterParameter"){
                    tempCasfPath = "/" + context.name.value + tempCasfPath
                }
                temp_filter.push({
                    name: context.name.value + "." + temp_filter2[j].name,
                    parameterValue: temp_filter2[j].parameterValue,
                    parameterName: tempParameterName,
                    parameterNameOld: temp_filter2[j].parameterNameOld,
                    csafPath: tempCasfPath,
                    csafType: temp_filter2[j].csafType
                });

                j++;
            }
            i++;
        }
    }else{
        if(context.arguments){
            let k = 0;
            while(k < context.arguments.length){
                var tempParameterName = context.arguments[0].name.value;
                var tempType = "string";
                if(tempParameterName == "exact"){
                    tempParameterName = "must";
                }
                if(tempParameterName == "younger" || tempParameterName == "older"){
                    tempType = "date";
                }
                temp_filter.push({
                    name: context.name.value,
                    parameterValue: context.arguments[0].value.value,
                    parameterName: tempParameterName,
                    parameterNameOld: context.arguments[0].name.value,
                    csafPath: "/" + context.name.value,
                    csafType: tempType
                });
                k++;
            }
        }
    }
    return temp_filter;
}

const graphQLhelper = new helper();

module.exports = graphQLhelper;