import React from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import Error from 'next/error';

import { initializeApollo } from '../../lib/client';
import {
  TaskDocument,
  TaskQuery,
  TaskQueryVariables,
  useTaskQuery,
} from '../../generated/graphql-frontend';
import UpdateTaskForm from '../../components/UpdateTaskForm';
import Custom404 from '../404';

const UpdateTask: NextPage = () => {
  const router = useRouter();
  const id =
    typeof router.query.id === 'string' ? parseInt(router.query.id) : NaN;

  const { data, loading, error } = useTaskQuery({ variables: { id } });

  if (!id) {
    return <Custom404 />;
  }

  const task = data?.task;

  return loading ? (
    <p className="loading">Loading...</p>
  ) : error ? (
    <p className="alert-error">ERROR: {error.message}</p>
  ) : task ? (
    <UpdateTaskForm id={task.id} currentValues={{ title: task.title }} />
  ) : (
    <p>Task not found...</p>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const id =
    typeof ctx.params?.id === 'string' ? parseInt(ctx.params.id, 10) : NaN;

  const apolloClient = initializeApollo();

  if (id) {
    await apolloClient.query<TaskQuery, TaskQueryVariables>({
      query: TaskDocument,
      variables: { id },
    });

    return {
      props: {
        initialApolloState: apolloClient.cache.extract(),
      },
    };
  }

  return {
    props: {},
  };
};

export default UpdateTask;
