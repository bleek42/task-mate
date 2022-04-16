import React from 'react';
import Link from 'next/link';

import { Task } from '../generated/graphql-frontend';
import TaskListItem from './TaskListItem';

interface TaskListProps {
  tasks: Task[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskListItem key={task.id} task={task} />
      ))}
    </ul>
  );
};

export default TaskList;
