const validateSignUp = (data) => {
  const errors = [];

  if (!data.firstName || data.firstName.trim() === "") {
    errors.push("First name is required");
  }
  if (!data.lastName || data.lastName.trim() === "") {
    errors.push("Last name is required");
  }
  if (!data.username || data.username.trim() === "") {
    errors.push("Username is required");
  }
  if (!data.email || data.email.trim() === "") {
    errors.push("Email is required");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push("Invalid email format");
    }
  }
  if (!data.password || data.password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }
  if (!data.role || !["freelancer", "client", "admin"].includes(data.role)) {
    errors.push("Role must be freelancer, client, or admin");
  }

  return errors;
};

const validateSignIn = (data) => {
  const errors = [];

  if (!data.email || data.email.trim() === "") {
    errors.push("Email is required");
  }
  if (!data.password || data.password.trim() === "") {
    errors.push("Password is required");
  }

  return errors;
};

const validateUpdateUser = (data) => {
  const errors = [];

  if (data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push("Invalid email format");
    }
  }
  if (data.password && data.password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  return errors;
};

export { validateSignUp, validateSignIn, validateUpdateUser };