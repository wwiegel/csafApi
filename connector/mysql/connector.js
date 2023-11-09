const { mysqlClient } = require('./mysqlconnection');

function convertGraphqlToSql(searchParameterArray) {
    //var sql = "SELECT * FROM `csafDocument` LEFT OUTER JOIN 'csafDocumentDocument' ON 'csafDocument.ID' = 'csafDocumentDocument.PARENT_ID' ;";
    var sql = "";

    let i = 0;
    while(i < searchParameterArray.length){
        if(searchParameterArray[i].selectionSet){
            sql = convertGraphqlToSql(searchParameterArray[i].selectionSet.selections);
        }else{
            i=i;
        }
        if(searchParameterArray[i].arguments.length > 0){
           sql += " `" + searchParameterArray[i].name.value + "`=`" + searchParameterArray[i].arguments[0].value.value + "`";
        }
        i++;
    }

    return sql;
}

function convertSearchParameterToSQLQuery(searchParameterArray) {
    //var sql = "SELECT * FROM `csafDocument` LEFT OUTER JOIN `csafDocumentDocument` ON `csafDocument`.`ID` = `csafDocumentDocument`.`PARENT_ID` ;";
    var sql = "SELECT * FROM `csafDocument` " +
    "LEFT OUTER JOIN `csafDocumentDocument` ON `csafDocument`.`ID` = `csafDocumentDocument`.`PARENT_ID` " +
    "LEFT OUTER JOIN `csafDocumentProductTree` ON `csafDocument`.`ID` = `csafDocumentProductTree`.`PARENT_ID` " +
    "LEFT OUTER JOIN `csafDocumentVulnerability` ON `csafDocument`.`ID` = `csafDocumentVulnerability`.`PARENT_ID` ";

    let i = 0;
    while(i < searchParameterArray.length){
        if(searchParameterArray[i].name.value == "searchParameter"){
            sql += "WHERE" + convertGraphqlToSql(searchParameterArray[i].selectionSet.selections) + ";";
        }
        i++;
    }

    return sql;
}

class connector {
    constructor(){
        this.name = "mySQL";
        //this.color = color; 
        //this.price = price;
    }
    
}

function Connector(context, args, userData, intermediateObject){
        //var queryName = context.path.prev.prev.prev.prev.key;

        //var sql = "SELECT * FROM `csafDocument` LEFT OUTER JOIN `csafDocumentDocument` ON `csafDocument`.`ID` = `csafDocumentDocument`.`PARENT_ID` ;";
        var sql = convertSearchParameterToSQLQuery(context.selectionSet.selections);
        sql = "SELECT * FROM `csafDocument` " +
        "LEFT OUTER JOIN `csafDocumentDocument` ON `csafDocument`.`ID` = `csafDocumentDocument`.`PARENT_ID` " +
        "LEFT OUTER JOIN `csafDocumentProductTree` ON `csafDocument`.`ID` = `csafDocumentProductTree`.`PARENT_ID` " +
        "LEFT OUTER JOIN `csafDocumentVulnerability` ON `csafDocument`.`ID` = `csafDocumentVulnerability`.`PARENT_ID` ";
    
        // run query
        return mysqlClient(sql)
            .then(
                //change response comming from mysql
                r => {
                    let _source = r.result;
                    let _source_json = mysql_to_json(r.result);

                    //fakefile
                    _source_json = fake_file();

                    _source = { "documents": [_source_json] };
                    return _source;
                }
            )
            .catch(e => {console.error(e);})
        ;
}

function fake_file(){
    return {
        "document" : {
          "aggregate_severity" : {
            "text" : "mittel"
          },
          "category" : "csaf_base",
          "csaf_version" : "2.0",
          "distribution" : {
            "tlp" : {
              "label" : "WHITE",
              "url" : "https://www.first.org/tlp/"
            }
          },
          "lang" : "de-DE",
          "notes" : [ {
            "category" : "legal_disclaimer",
            "text" : "Das BSI ist als Anbieter für die eigenen, zur Nutzung bereitgestellten Inhalte nach den allgemeinen Gesetzen verantwortlich. Nutzerinnen und Nutzer sind jedoch dafür verantwortlich, die Verwendung und/oder die Umsetzung der mit den Inhalten bereitgestellten Informationen sorgfältig im Einzelfall zu prüfen."
          }, {
            "category" : "description",
            "text" : "WithSecure Endpoint Protection bezeichnet eine Produktfamilie von Sicherheitslösungen für Endpoints verschiedener Betriebssysteme.\r\nInternet Gatekeeper ist eine Anti-Virus Lösung für Internetgateways und E-Mail-Server.\r\nF-Secure ist ein Hersteller einer Vielzahl von Antivirusprodukten für Client und Server.",
            "title" : "Produktbeschreibung"
          }, {
            "category" : "summary",
            "text" : "Ein entfernter Angreifer kann eine Schwachstelle in WithSecure Endpoint Protection, F-Secure Internet Gatekeeper und F-Secure Linux Security ausnutzen, um einen Denial of Service Angriff durchzuführen.",
            "title" : "Angriff"
          }, {
            "category" : "general",
            "text" : "- Linux\n- MacOS X\n- Windows",
            "title" : "Betroffene Betriebssysteme"
          } ],
          "publisher" : {
            "category" : "other",
            "contact_details" : "csaf-provider@cert-bund.de",
            "name" : "Bundesamt für Sicherheit in der Informationstechnik",
            "namespace" : "https://www.bsi.bund.de"
          },
          "references" : [ {
            "category" : "self",
            "summary" : "wid-sec-w-2023-1256 - CSAF Version",
            "url" : "https://wid.cert-bund.de/.well-known/csaf/white/2023/wid-sec-w-2023-1256.json"
          }, {
            "category" : "self",
            "summary" : "WID-SEC-2023-1256 - Portal Version",
            "url" : "https://wid.cert-bund.de/portal/wid/securityadvisory?name=WID-SEC-2023-1256"
          }, {
            "category" : "external",
            "summary" : "WithSecure Security Advisory vom 2023-05-19",
            "url" : "https://www.withsecure.com/en/support/security-advisories/cve-2023-nnn5121"
          } ],
          "source_lang" : "en-US",
          "title" : "WithSecure Produkte: Schwachstelle ermöglicht Denial of Service",
          "tracking" : {
            "current_release_date" : "2023-05-18T22:00:00.000+00:00",
            "generator" : {
              "date" : "2023-05-19T11:40:51.180+00:00",
              "engine" : {
                "name" : "BSI-WID",
                "version" : "1.1.0"
              }
            },
            "id" : "wid-sec-w-2023-1256",
            "initial_release_date" : "2023-05-18T22:00:00.000+00:00",
            "revision_history" : [ {
              "date" : "2023-05-18T22:00:00.000+00:00",
              "number" : "1",
              "summary" : "Initiale Fassung"
            } ],
            "status" : "final",
            "version" : "1"
          }
        },
        "product_tree" : {
          "full_product_names" : [ {
            "name" : "F-Secure Linux Security",
            "product_id" : "T004062"
          }, {
            "name" : "F-Secure Internet Gatekeeper",
            "product_id" : "T020553"
          }, {
            "name" : "WithSecure Endpoint Protection",
            "product_id" : "T026237"
          } ]
        },
        "vulnerabilities" : [ {
          "notes" : [ {
            "category" : "description",
            "text" : "Es existiert eine Schwachstelle in WithSecure Endpoint Protection, F-Secure Linux Security und F-Secure Internet Gatekeeper. Bei der Verarbeitung von PE Dateien kann die Scanner-Komponente abstürzen. Ein Angreifer kann dies für einen Denial of Service Angriff ausnutzen."
          } ],
          "product_status" : {
            "known_affected" : [ "T020553", "T026237", "T004062" ]
          },
          "release_date" : "2023-05-18T22:00:00Z"
        } ]
      }
}

function mysql_to_json(array){
    var graphQL = [];

    let i = 0;
    while(i < array.length){
        console.log(array[i].filename);
        graphQL.push({
            document: {},
            product_tree: [],
            vulnerabilities: []
        });
        i++;
    }
    return graphQL;
}

const mysqlConnector = new connector();

module.exports = { 
    connect: Connector,
    name: mysqlConnector.name
};