import { ApolloServerPluginLandingPageGraphQLPlayground, UserInputError } from 'apollo-server-core';
import { ApolloServer, gql } from 'apollo-server-micro';
import { IResolvers } from '@graphql-tools/utils';
import { NextApiHandler } from 'next';
import mysql from 'serverless-mysql';
import { OkPacket } from 'mysql';
import * as dotenv from 'dotenv';
import { Resolvers, Task, TaskStatus } from '../../generated/graphql-backend';

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
interface TaskDbRow {
	id: number;
	title: string;
	status: TaskStatus;
}

type TasksDbQuery = TaskDbRow[];

const getTaskById = async (id: number, db: mysql.ServerlessMysql) => {
	const tasks = await db.query<TasksDbQuery>('SELECT id, title, status FROM tasks WHERE id = ?', [
		[id],
	]);
	const { title, status } = tasks[0];
	return tasks.length ? { id, title, status } : null;
};

const resolvers: Resolvers<ApolloContext> = {
	Query: {
		async tasks(parent, args, context) {
			const { status } = args;
			const params: string[] = [];
			let query = 'SELECT id, title, status FROM tasks';
			if (status) {
				query += 'WHERE status = ?';
				params.push(status);
			}
			const tasks = await context.db.query<TasksDbQuery>(query, [status]);
			await db.end();
			return tasks.map(({ id, title, status }) => ({ id, title, status }));
		},

		async task(parent, args, context) {
			// const tasks = await context.db.query<TasksDbQuery>(
			// 	'SELECT id, title, status FROM tasks WHERE id = ?',
			// 	[args.id],
			// );
			// const { id, title, status } = tasks[0];
			// return tasks.length ? { id, title, status } : null;
			return await getTaskById(args.id, context.db);
		},
	},

	Mutation: {
		async createTask(parent, args: { input: { title: string } }, context): Promise<Task> {
			const result = await context.db.query<OkPacket>(
				'INSERT INTO tasks (title, status) VALUES(?, ?)',
				[args.input.title, TaskStatus.Active],
			);
			return {
				id: result.insertId,
				title: args.input.title,
				status: TaskStatus.Active,
			};
		},

		async updateTask(parent, args, context) {
			const { id, title, status } = args.input;
			const query: string[] = [];
			const params: any[] = [];
			if (title) {
				query.push('title = ?');
				params.push(title);
			}
			if (status) {
				query.push('status = ?');
				params.push(status);
			}
			if (!id) {
				throw new UserInputError(`Task id:${id} not found...`);
			}
			if (!title || !status) {
				throw new UserInputError('No task updates provided...');
			}
			params.push(id);
			await context.db.query(`UPDATE tasks SET ${query.join(',')} WHERE id = ?`, params);
			return await getTaskById(id, context.db);
		},

		async deleteTask(parent, args, context) {
			const task = await getTaskById(args.id, context.db);
			if (!task) throw new UserInputError('Task not found...');
			await context.db.query('DELETE FROM tasks WHERE id = ?', [args.id]);
			return task;
		},
	},
};

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
