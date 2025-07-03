import { useAuthStore } from "./(auth)/store";
import { Navigate, useLocation } from "react-router-dom";

export const Middleware = ({ children }) => {
  const { isAuthenticated, authUser } = useAuthStore();

  const location = useLocation();

  /**
   * Require Authenticated
   * avoid public path
   * redirect to login
   */
  if (
    !isAuthenticated &&
    !(location.pathname === "/") &&
    !(location.pathname === "/sign-up") &&
    ["sign-in"].find((route) => !location.pathname.includes(route))
    // !Object.values({ ...ROUTES, ...ROUTES.auth.children }).find(
    //   (route) =>
    //     route.path &&
    //     route.path !== "/" &&
    //     location.pathname.includes(route),
    // )
  ) {
    return (
      <Navigate
        to={"sign-in"}
        // to={"signin" + "?to=" + location.pathname}
        // state={{ from: location }}
        replace
      />
    );
  }

  if (isAuthenticated && authUser) {
    if (["sign-in"].find((route) => location.pathname.includes(route))) {
      let path = "/";
      if (authUser.role === "Admin") {
        path = "/dashboard";
      } else if (authUser.role === "Student") {
        path = "/student";
      } else if (authUser.role === "Teacher") {
        path = "/report";
      } else {
        // setErrorMessage("Unknown user role.");
      }
      //   const pathState = searchParams.get("to");

      return (
        <Navigate
          to={path}
          //   to={pathState ?? path}
          // to={withLocalePath(!hasAccess ? homePath : pathState ?? homePath)}
        />
      );
    }
  }
  return <>{children}</>;
};
