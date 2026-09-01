// Centralized API utility for Skillora
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthToken = () => {
  return localStorage.getItem("token") || "";
};

const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  if (config.body && typeof config.body !== "string") {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get("content-type");
    const data =
      contentType && contentType.includes("application/json")
        ? await response.json()
        : null;

    if (!response.ok) {
      throw new Error(
        (data && (data.message || data.error)) ||
          `Request failed with status ${response.status}`
      );
    }

    return data;
  } catch (err) {
    throw err;
  }
};

export const api = {
  get: (endpoint) => request(endpoint, { method: "GET" }),
  post: (endpoint, body) => request(endpoint, { method: "POST", body }),
  put: (endpoint, body) => request(endpoint, { method: "PUT", body }),
  delete: (endpoint) => request(endpoint, { method: "DELETE" }),
};

// Resource-specific helpers
export const projectsApi = {
  list: (params = "") => api.get(`/projects${params ? `?${params}` : ""}`),
  get: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post("/projects", data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  remove: (id) => api.delete(`/projects/${id}`),
};

export const applicationsApi = {
  list: (params = "") => api.get(`/applications${params ? `?${params}` : ""}`),
  get: (id) => api.get(`/applications/${id}`),
  update: (id, data) => api.put(`/applications/${id}`, data),
};

export const categoriesApi = {
  list: () => api.get("/categories"),
  get: (id) => api.get(`/categories/${id}`),
};

export default api;