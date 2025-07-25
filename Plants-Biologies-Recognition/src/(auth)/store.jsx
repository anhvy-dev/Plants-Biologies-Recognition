import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import { authApi } from "./services";

export const AUTH_LOCALSTORAGE_KEY = "auth";

export const useAuthStore = create()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isKeepLogin: true,
      authUser: null,
      accessToken: null,
      // refreshToken: null,
      login: (input) =>
        new Promise((resolve, reject) => {
          // If input contains a token, it's from Google sign-in
          if (input.token && input.user) {
            set({
              isAuthenticated: true,
              isKeepLogin: true,
              accessToken: input.token,
              authUser: {
                id: input.user.id,
                name: input.user.name,
                role: input.user.role,
                email: input.user.email,
              },
            });
            localStorage.setItem("token", input.token);
            resolve(input);
            return;
          }
          // Otherwise, do normal login
          authApi
            .login(input)
            .then((res) => {
              const decodedToken = jwtDecode(res.data.token);

              const role =
                decodedToken.role ||
                decodedToken[
                  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
                ];
              const name =
                decodedToken.name ||
                decodedToken.unique_name ||
                decodedToken[
                  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
                ];

              // Use response structure from backend
              set({
                isAuthenticated: true,
                isKeepLogin: input.isKeepLogin,
                accessToken: res.data.token,
                authUser: {
                  id: res.data.user_Id,
                  name: res.data.fullName || name,
                  role: res.data.role || role,
                  email: res.data.email,
                  account: res.data.account,
                },
              });
              localStorage.setItem("token", res.data.token);
              resolve(res.data);
            })
            .catch((error) => {
              reject(error);
            });
        }),
      //   loginWithToken: (input: LoginResponse) =>
      //     new Promise((resolve) => {
      //       const tokenDecoded = jwtDecode<AuthUser>(input.access_token);
      //       set({
      //         isAuthenticated: true,
      //         accessToken: input.access_token,
      //         refreshToken: input.refresh_token,
      //         authUser: tokenDecoded,
      //       });
      //       resolve(tokenDecoded);
      //     }),
      logout: () => {
        set({
          isAuthenticated: false,
          authUser: null,
          accessToken: null,
          // refreshToken: null,
          // accesses: null,
        });
        localStorage.removeItem("token"); // <-- Reset token after logout
        // localStorage.removeItem("customerView");
      },
      accesses: null,
      setAccesses: (accesses) =>
        set(() => ({
          accesses: accesses,
        })),
    }),
    {
      name: AUTH_LOCALSTORAGE_KEY,
      // partialize: (state) => {
      //   if (!state.isKeepLogin) {
      //     state.isAuthenticated = false;
      //   }
      //   return state;
      // },
    }
  )
);
