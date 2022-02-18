import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer, gql } from 'apollo-server-micro';
import { IResolvers } from '@graphql-tools/utils';
import { NextApiHandler } from 'next';
import mysql from 'serverless-mysql';
import * as dotenv from 'dotenv';

dotenv.config();

const typeDefs = gql`
	enum TaskStatus {
		active
		completed
	}

	type Task {
		id: Int!
		title: String!
		status: TaskStatus!
	}

	type Query {
		tasks(status: TaskStatus): [Task!]!
		task(id: Int!): Task
	}

	input CreateTaskInput {
		title: String!
	}

	input UpdateTaskInput {
		id: Int!
		title: String
		status: TaskStatus
	}

	type Mutation {
		createTask(input: CreateTaskInput!): Task
		updateTask(input: UpdateTaskInput!): Task
		deleteTask(id: Int!): Task
	}
`;

interface ApolloContext {
	db: mysql.ServerlessMysql;
}

const resolvers: IResolvers<any, ApolloContext> = {
	Query: {
		async tasks(parent, args, context) {
			const result = await context.db.query('SELECT "hello world" AS hello_world');
			await db.end();
			console.log(result);
			return [];
		},

		async task(parent, args, context) {
			return null;
		},
	},

	Mutation: {
		async createTask(parent, args, context) {
			return null;
		},

		async updateTask(parent, args, context) {
			return null;
		},

		async deleteTask(parent, args, context) {
			return null;
		},
	},
};

const db = mysql({
	config: {
		host: process.env.MYSQL_HOST,
		port: 3306,
		user: process.env.MYSQL_USER,
		password: process.env.MYSQL_PASSWORD,
		database: process.env.MYSQL_DATABASE,
	},
});

const server = new ApolloServer({
	typeDefs,
	resolvers,
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
