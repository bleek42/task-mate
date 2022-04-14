import React, { useState } from 'react';
import { useCreateTaskMutation } from '../generated/graphql-frontend';

interface TaskFormProps {
  onSuccess: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSuccess }) => {
  const [title, setTitle] = useState('');
  const [createTask, { loading, error }] = useCreateTaskMutation({
    onCompleted: () => {
      onSuccess(), setTitle('');
    },
  });

  const handleChange = (ev: React.ChangeEvent<HTMLInputElement>): void => {
    setTitle(ev.target.value);
  };
  const handleSubmit = async (
    ev: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    ev.preventDefault();
    if (!loading) {
      try {
        await createTask({ variables: { input: { title } } });
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="alert-error">Error adding new task!</p>}
      <input
        className="text-input new-task-text-input"
        type="text"
        name="title"
        value={title}
        onChange={handleChange}
        placeholder="What task is next?"
        autoComplete="off"
      />
    </form>
  );
};

export default TaskForm;
