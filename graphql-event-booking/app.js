const express = require("express");
const bodyparser = require("body-parser");
const httpGraphql = require("express-graphql");
const { buildSchema } = require("graphql");

const app = express();

app.use(bodyparser.json());

// GraphQL will have only one endpoint, appended "api" at the end of endpoint.
app.use(
  "/GraphQL/api",
  httpGraphql({
    schema: buildSchema(`
        type RootQuery {
            events: [String!]!
        }

        type RootMutation {
            createEvent(name: String): String
        }
        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
      events: () => {
        return ["Sudheer", "Kumar", "Papineni"];
      },
      createEvent: args => {
        const name = args.name;
        return name;
      }
    },
    graphiql: true
  })
);

app.listen(3000);
