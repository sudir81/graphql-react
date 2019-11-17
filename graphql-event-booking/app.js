const express = require("express");
const bodyparser = require("body-parser");
const httpGraphql = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Event = require("./models/event");
const User = require("./models/user");

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

        type User {
          _id: ID
          email: String!
          password: String
        }

        input EventInput {
          title: String!
          description: String!
          price: Float!
          date: String!
        }

        input UserInput {
          email: String!
          password: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(inputEvent: EventInput): Event
            createUser(inputUser: UserInput): User
        }
        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
      events: () => {
        return Event.find()
          .then(events => {
            return events.map(event => {
              return { ...event._doc, _id: event._doc._id.toString() };
            });
          })
          .catch(err => {
            console.log(err);
            throw err;
          });
      },
      createEvent: args => {
        const event = new Event({
          title: args.inputEvent.title,
          description: args.inputEvent.description,
          price: +args.inputEvent.price,
          date: new Date(args.inputEvent.date),
          owner: "5dcff67ae9e51db2ea986b36"
        });

        let createdEvent;
        return event
          .save()
          .then(result => {
            createdEvent = { ...result._doc, _id: result._doc._id.toString() };
            return User.findById("5dcff67ae9e51db2ea986b36");
          })
          .then(user => {
            if (!user) {
              throw new Error("User not found");
            }

            user.createdEvents.push(event);
            return user.save();
          })
          .then(result => {
            return createdEvent;
          })
          .catch(err => {
            console.log(err);
            throw err;
          });
      },
      createUser: args => {
        return User.findOne({ email: args.inputUser.email })
          .then(user => {
            if (user) {
              throw new Error("User already exists");
            }
            return bcrypt.hash(args.inputUser.password, 12);
          })
          .then(encryptedPassword => {
            const user = new User({
              email: args.inputUser.email,
              password: encryptedPassword
            });
            return user.save();
          })
          .then(result => {
            console.log(result);
            return { ...result._doc, _id: result.id };
          })
          .catch(err => {
            throw err;
          });
      }
    },
    graphiql: true
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-muaei.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
