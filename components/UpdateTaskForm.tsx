import { isApolloError } from '@apollo/client';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useUpdateTaskMutation } from '../generated/graphql-frontend';

interface UpdateTaskFormValues {
  title: string;
}

interface UpdateTaskFormProps {
  readonly id: number;
  currentValues: UpdateTaskFormValues;
}

const UpdateTaskForm: React.FC<UpdateTaskFormProps> = ({
  id,
  currentValues,
}) => {
  const router = useRouter();
  const [values, setValues] = useState<UpdateTaskFormValues>(currentValues);
  const [updateTask, { loading, error }] = useUpdateTaskMutation();

  const handleChange = (ev: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = ev.target;
    setValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleSubmit = async (
    ev: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    ev.preventDefault();
    try {
      const result = await updateTask({
        variables: { input: { id, title: values.title } },
      });
      if (result.data?.updateTask) {
        router.push('/');
      }
    } catch (ex: any) {
      if (isApolloError(ex)) {
        throw ex;
      }
      console.error(ex);
    }
  };

  let errMsg: string = '';
  if (error) {
    if (error.networkError) {
      errMsg =
        'Cannot reach network... Please check your connection, refresh your browser, and try again!';
    }
    errMsg =
      'Please refresh and try again! If the issue persists, contact support.';
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="alert-error">ERROR: {errMsg}</p>}
      <label htmlFor="title" className="field-label">
        Title
      </label>
      <input
        name="title"
        type="text"
        className="text-input"
        value={values.title}
        onChange={handleChange}
      />
      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? 'Loading...' : 'Update'}
      </button>
    </form>
  );
};

export default UpdateTaskForm;
