import React, { useEffect } from 'react';
import Link from 'next/link';
import { isApolloError, Reference } from '@apollo/client';

import {
  Task,
  TaskStatus,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
} from '../generated/graphql-frontend';

interface TaskListItemProps {
  task: Task;
}

const TaskListItem: React.FC<TaskListItemProps> = ({ task }) => {
  const [deleteTask, { loading, error }] = useDeleteTaskMutation({
    variables: { id: task.id },
    errorPolicy: 'all',
    update: (cache, result) => {
      const deletedTask = result.data?.deleteTask;
      if (deletedTask) {
        cache.modify({
          fields: {
            tasks(taskRefs: Reference[], { readField }) {
              return taskRefs.filter(
                (taskRef) => readField('id', taskRef) !== deletedTask.id
              );
            },
          },
        });
      }
    },
  });

  useEffect(() => {
    (() => {
      if (error) {
        console.error(error);
        if (isApolloError(error)) {
          alert(`ERROR: ${error.networkError} - ${error.message}`);
        }
        alert(`ERROR: ${error.message}`);
      }
    })();
  }, [error]);

  const [
    updateTask,
    { loading: loadingStatusUpdate, error: errorStatusUpdate },
  ] = useUpdateTaskMutation({
    errorPolicy: 'all',
  });

  useEffect(() => {
    (() => {
      if (errorStatusUpdate) {
        console.error(errorStatusUpdate);
        const { networkError, message } = errorStatusUpdate;
        if (isApolloError(errorStatusUpdate)) {
          alert(`ERROR: ${networkError} - ${message}`);
        }
        alert(`ERROR: ${message}`);
      }
    })();
  }, [errorStatusUpdate]);

  const handleChangeStatus = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus = ev.target.checked
      ? TaskStatus.Completed
      : TaskStatus.Active;
    updateTask({ variables: { input: { id: task.id, status: newStatus } } });
  };

  const handleDelete = async (): Promise<void> => {
    try {
      await deleteTask();
    } catch (ex: any) {
      console.error(ex);
    }
  };

  return (
    <li className="task-list-item" key={task.id}>
      <label className="checkbox">
        <input
          type="checkbox"
          className="checkbox"
          onChange={handleChangeStatus}
          checked={task.status === TaskStatus.Completed}
          disabled={loadingStatusUpdate}
        />
        <span className="checkbox-mark">&#10003;</span>
      </label>
      <Link href="/update/[id]" as={`/update/${task.id}`}>
        <a className="task-list-item-title">{task.title} </a>
      </Link>
      <button
        className="task-list-item-delete"
        onClick={handleDelete}
        disabled={loading}
      >
        &times;
      </button>
    </li>
  );
};

export default TaskListItem;
