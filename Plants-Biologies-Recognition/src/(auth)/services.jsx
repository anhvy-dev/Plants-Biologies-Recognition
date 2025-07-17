import api from "../config/axios.jsx";
export const authApi = {
  login: ({ identifier, password }) =>
    api.post(
      "Authentication/login",
      { identifier, password },
      { headers: { "Content-Type": "application/json" } }
    ),
};
