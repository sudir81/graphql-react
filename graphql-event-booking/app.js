const express = require("express");
const bodyparser = require("body-parser");
const httpGraphql = require("express-graphql");
const { buildSchema } = require("graphql");

const app = express();
const events = [];

app.use(bodyparser.json());

// GraphQL will have only one endpoint, appended "api" at the end of endpoint.
app.use(
  "/GraphQL/api",
  httpGraphql({
    schema: buildSchema(`
        type Event {
          _id: ID
          title: String!
          description: String!
          price: Float!
          date: String!
        }

        input EventInput {
          title: String!
          description: String!
          price: Float!
          date: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(inputEvent: EventInput): Event
        }
        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
      events: () => {
        return events; //["Sudheer", "Kumar", "Papineni"];
      },
      createEvent: args => {
        const event = {
          _id: Math.random().toString(),
          title: args.inputEvent.title,
          description: args.inputEvent.description,
          price: +args.inputEvent.price,
          date: args.inputEvent.date
        };
        events.push(event);
        return event;
      }
    },
    graphiql: true
  })
);

app.listen(3000);
