import { ApolloServerPluginLandingPageGraphQLPlayground, UserInputError } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-micro';
import { NextApiHandler } from 'next';
import mysql from 'serverless-mysql';

import * as dotenv from 'dotenv';
import { schema } from '../../backend/schema';

dotenv.config();

const db = mysql({
	config: {
		host: process.env.MYSQL_HOST,
		port: 3306,
		user: process.env.MYSQL_USER,
		password: process.env.MYSQL_PASSWORD,
		database: process.env.MYSQL_DATABASE || 'task_mate',
	},
});

const server = new ApolloServer({
	schema,
	context: { db },
	plugins: [
		...(process.env.NODE_ENV === 'development'
			? [ApolloServerPluginLandingPageGraphQLPlayground]
			: []),
	],
});

const serverStart = server.start();
let graphqlHandler: NextApiHandler | undefined;

const handler: NextApiHandler = async (req, res) => {
	if (!graphqlHandler) {
		await serverStart;
		graphqlHandler = server.createHandler({ path: '/api/graphql' });
	}
	return graphqlHandler(req, res);
};

export const config = {
	api: {
		bodyParser: false,
	},
};

export default handler;
