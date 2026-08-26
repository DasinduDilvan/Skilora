const validateProject = (data) => {
  const errors = [];

  if (!data.clientId || data.clientId.trim() === "") {
    errors.push("Client ID is required");
  }
  if (!data.title || data.title.trim() === "") {
    errors.push("Project title is required");
  }
  if (!data.description || data.description.trim() === "") {
    errors.push("Project description is required");
  }
  if (!data.budget || data.budget <= 0) {
    errors.push("Valid budget is required");
  }
  if (!data.deadline) {
    errors.push("Deadline is required");
  }

  return errors;
};

const validateTask = (data) => {
  const errors = [];

  if (!data.title || data.title.trim() === "") {
    errors.push("Task title is required");
  }

  return errors;
};

export { validateProject, validateTask };