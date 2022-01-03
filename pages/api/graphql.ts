import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer, gql } from 'apollo-server-micro';
import { IResolvers } from '@graphql-tools/utils';
import { NextApiHandler } from 'next';

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

const resolvers: IResolvers = {
	Query: {
		tasks(parent, args, context) {
			return [];
		},

		task(parent, args, context) {
			return null;
		},
	},

	Mutation: {
		createTask(parent, args, context) {
			return null;
		},

		updateTask(parent, args, context) {
			return null;
		},

		deleteTask(parent, args, context) {
			return null;
		},
	},
};

const server = new ApolloServer({
	typeDefs,
	resolvers,

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
