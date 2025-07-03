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

              set({
                isAuthenticated: true,
                isKeepLogin: input.isKeepLogin,
                accessToken: res.data.token,
                authUser: {
                  id: res.data.user.userId,
                  name: name || res.data.user.name,
                  role: role || res.data.user.role,
                },
              });

              resolve(res.data.user);
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
