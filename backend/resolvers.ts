import { OkPacket } from 'mysql';
import { UserInputError } from 'apollo-server-micro';
import { TaskStatus, Task, Resolvers } from '../generated/graphql-backend';
import { ServerlessMysql } from 'serverless-mysql';

interface ApolloContext {
	db: ServerlessMysql;
}
interface TaskDbRow {
	id: number;
	title: string;
	status: TaskStatus;
}

type TasksDbQuery = TaskDbRow[];

const getTaskById = async (id: number, db: ServerlessMysql) => {
	const tasks = await db.query<TasksDbQuery>('SELECT id, title, status FROM tasks WHERE id = ?', [
		[id],
	]);
	const { title, status } = tasks[0];
	return tasks.length ? { id, title, status } : null;
};

export const resolvers: Resolvers<ApolloContext> = {
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
			await context.db.end();
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
