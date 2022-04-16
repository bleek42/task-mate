import type { NextPage } from 'next';
import { useRouter } from 'next/router';

const Custom404: NextPage = () => {
  const router = useRouter();
  return (
    <>
      <h3>!ERROR: STATUS CODE 404!</h3>
      <p>
        Resource not found... Click the button below to go back to the Home
        Page!
      </p>
      <button className="submit-btn" onClick={() => router.push('/')}>
        Back
      </button>
    </>
  );
};

export default Custom404;
