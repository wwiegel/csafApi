const config = require("./config");
const logger = require("./logger");
//process.env.NODE_ENV = config.csafServer.csafServerStage;
const { ApolloServer } = require("apollo-server");
//const { ApolloGateway } = require("@apollo/gateway");
const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");
const depthLimit = require("graphql-depth-limit");
const server = new ApolloServer({ 
  typeDefs, 
  resolvers, 
  /*formatError: (formattedError, error) => {
    // Return a different error message
    if (
      formattedError.extensions.code ===
      ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED
    ) {
      return {
        ...formattedError,
        message: "Your query doesn't match the schema. Try double-checking it!",
      };
    }

    // Otherwise return the formatted error. This error can also
    // be manipulated in other ways, as long as it's returned.
    return formattedError;
  },*/
  introspection: config.csafServer.csafServerStage !== "production",
  context: ({req }) => {
    const token = req.headers.token || null;
    return{token};
  },
  validationRules: [depthLimit(config.csafServer.csafDepthLimit)]
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
  logger.log("server", `Server ready at ${url}`);
});

/**
 * TODOs
 * 1. 
 * 2. Logging einbauen (eventuell in Elasticsearch)
 *    + Authentificationfailure
 *    + Querylogging (deep nested queries)
 * 3. 
 * 4. Nicht alle API Zugriffe sind mit Authentifizierung versorgt
 *    Bisher nur csafApi, die restlichen müssen auch
 * 5. 
 * 6. Sollte ich Benutzernamen vorsehen um Bruteforce Angriffe überhaupt erkennen zu können.
 *    Ein Durchprobieren der Token scheint zu einfach zu sein.
 *    Eventuell reicht es ja eine E-Mailadresse dazuzunehmen.
 *    Es muss auch möglich sein Nutzer zeitlich zu sperren,
 *    um Bruteforce zu erschweren.
 * 7. Haben die vom Himmel fallenden Tokens ein Verfallsdatum?
 *    Wenn ja, dann sollten diese nicht in einer Datei liegen, 
 *    die genau einmal beim Start des Servers geladen wird.
 *    -> Token wird an Auth-Funktion übergeben
 * 8. Maximum query depth:
 *    https://www.howtographql.com/advanced/4-security/
 * 9. validationRules: [depthLimit(2)]
 *    Bei Überschreitung, zu viele Informationen, es wird sogar das Home directory angezeigt.
 * 10.Unter csafApi/documents können auch Parameter eingegeben werden,
 *    das wird nicht verhindert. Sollten hier Fehler ausgegeben werden,
 *    wenn doch Parameter eingegeben werden?
 *    Gibt es auch Möglichkeiten eine Warnung aus zugeben?
 * 11."CSAF Elemetn exists" ist als Abfrage noch nicht implementiert.
 *    searchParameter.must ohne Attribute, wird als exist gewertet
 * 12.
 * 13.filterParameter wurde wieder in filterArrays umbenannt,
 *    Im Resolver (helper) müssen jetzt Umbenennungen statt finden.
 *    Komando zurück, unüberschaubarer Aufwand im Code.
 * 13.Resolver (helper) arbeitet auf treepath, json_path soll verwendet werden.
 * 
 */


