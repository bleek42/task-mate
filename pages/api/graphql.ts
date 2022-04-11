import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { ApolloServer } from "apollo-server-micro";
import { NextApiHandler } from "next";

import { schema } from "../../backend/schema";
import { db } from "../../backend/config";

const server = new ApolloServer({
  schema,
  context: { db },
  plugins: [
    ...(process.env.NODE_ENV === "development"
      ? [ApolloServerPluginLandingPageGraphQLPlayground]
      : []),
  ],
});

const serverStart = server.start();
let graphqlHandler: NextApiHandler | undefined;

const handler: NextApiHandler = async (req, res) => {
  if (!graphqlHandler) {
    await serverStart;
    graphqlHandler = server.createHandler({ path: "/api/graphql" });
  }
  return graphqlHandler(req, res);
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
