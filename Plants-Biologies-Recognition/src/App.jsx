import React from "react";
import { Outlet, RouterProvider } from "react-router-dom";
import { useRoutes } from "react-router-dom";

import LandingPage from "./landing-page/LandingPage";
import Signin from "./sign-in/SignIn";
import Signup from "./sign-up/SignUp";

import Admin from "./admin/admin";
import Account from "./admin/pages/Account";
import Dashboard from "./admin/pages/Dashboard";
import Feedback from "./admin/pages/Feedback";
import Book from "./admin/pages/Book";

import Student from "./student/Student";

import Teacher from "./teacher/teacher";
import Report from "./teacher/pages/Report";

import { createRoutes } from "./routes/utils";
import { useAuthStore } from "./(auth)/store";
const App = () => {
  const { authUser } = useAuthStore();

  const router = [
    {
      path: "/",
      element: <LandingPage />,
    },
    {
      path: "*",
      element: <>Page not found</>,
    },
    {
      path: "sign-in",
      element: <Signin />,
    },
    {
      path: "sign-up",
      element: <Signup />,
    },
    {
      element: <Student />,
      accessKey: "Student",
      children: [{ path: "student", element: <Student /> }],
    },
    {
      element: <Teacher />,
      accessKey: "Teacher",
      children: [{ path: "report", element: <Report /> }],
    },
    {
      element: <Admin />,
      accessKey: "Admin",
      children: [
        { index: true, element: <Dashboard /> }, // This makes /admin go to Dashboard
        { path: "dashboard", element: <Dashboard /> },
        { path: "account", element: <Account /> },
        { path: "feedback", element: <Feedback /> },
        { path: "book", element: <Book /> },
      ],
    },
  ];

  const content = useRoutes(
    createRoutes({ routes: router, userRole: authUser?.role })
  );
  return content;
  // return <RouterProvider router={router} />;
};

export default App;
