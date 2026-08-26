const validateApplication = (data) => {
  const errors = [];

  if (!data.projectId || data.projectId.trim() === "") {
    errors.push("Project ID is required");
  }
  if (!data.freelancerId || data.freelancerId.trim() === "") {
    errors.push("Freelancer ID is required");
  }
  if (!data.coverLetter || data.coverLetter.trim() === "") {
    errors.push("Cover letter is required");
  }
  if (!data.proposedBudget || data.proposedBudget <= 0) {
    errors.push("Valid proposed budget is required");
  }
  if (!data.estimatedDuration || data.estimatedDuration <= 0) {
    errors.push("Valid estimated duration is required");
  }

  return errors;
};

export { validateApplication };