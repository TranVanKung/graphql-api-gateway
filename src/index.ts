import express, { Application } from 'express';
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';
import dotenv from 'dotenv';

dotenv.config();

const graphQlPath = '/graphql';
const { PORT } = process.env;

// Window Docker Host: host.docker.internal
// MacOS Docker Host: docker.for.mac.host.internal

const DOCKER_MACHINE_HOST = 'docker.for.mac.host.internal';

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      {
        name: 'token_service',
        url: `http://${DOCKER_MACHINE_HOST}:3000/graphql`,
      },
      {
        name: 'market_service',
        url: `http://${DOCKER_MACHINE_HOST}:3001/graphql`,
      },
    ],
  }),
});

const apolloServer = new ApolloServer({
  gateway,
  introspection: true,
  plugins: [
    ApolloServerPluginLandingPageGraphQLPlayground({
      settings: {
        'editor.theme': 'dark',
      },
    }),
  ],
});

const app: Application = express();
app.use(express.json());
app.use(express.urlencoded());

(async () => {
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: graphQlPath });

  app.listen(PORT, () => {
    console.log(
      `🚀 GraphQL server ready at http://localhost:${PORT}${graphQlPath}`
    );
  });
})();
