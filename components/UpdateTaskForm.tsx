import React, { useState } from 'react';

interface UpdateTaskFormValues {
  title: string;
}

interface UpdateTaskFormProps {
  currentValues: UpdateTaskFormValues;
}

const UpdateTaskForm: React.FC<UpdateTaskFormProps> = ({ currentValues }) => {
  const [values, setValues] = useState<UpdateTaskFormValues>(currentValues);

  const handleChange = (ev: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = ev.target;
    setValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  return (
    <form>
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
      <button type="submit" className="submit-btn">
        Save
      </button>
    </form>
  );
};

export default UpdateTaskForm;
