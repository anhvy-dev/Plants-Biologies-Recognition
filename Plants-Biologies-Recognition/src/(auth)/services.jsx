import api from "../config/axios.jsx";
export const authApi = {
  login: ({ account, password }) =>
    api.post(
      "Authentication/login",
      { account, password },
      { headers: { "Content-Type": "application/json" } }
    ),
};
