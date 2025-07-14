import React from "react";
import { Outlet, RouterProvider } from "react-router-dom";
import { useRoutes } from "react-router-dom";

import LandingPage from "./landing-page/LandingPage";
import Signin from "./sign-in/SignIn";
import Signup from "./sign-up/SignUp";

import Admin from "./admin/Admin";
import Account from "./admin/components/AccountGrid";
import Dashboard from "./admin/components/MainGrid";
import Feedback from "./admin/components/AccountGrid";
import Book from "./admin/components/BookGrid";
import Chapter from "./admin/components/ChapterGrid";
import Lesson from "./admin/components/LessonGrid";
import Biology from "./admin/components/BiologyGrid";

import Student from "./student/Student";

import Teacher from "./teacher/Teacher";
import Report from "./teacher/components/MainGrid";
import TeacherBook from "./teacher/components/TeacherBookGrid";
import TeacherChapter from "./teacher/components/TeacherChapterGrid";
import TeacherLesson from "./teacher/components/TeacherLessonGrid";

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
      children: [
        { path: "report", element: <Report /> },
        { path: "book", element: <TeacherBook /> },
        { path: "chapter", element: <TeacherChapter /> },
        { path: "lesson", element: <TeacherLesson /> },
      ],
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
        { path: "chapter", element: <Chapter /> },
        { path: "lesson", element: <Lesson /> },
        { path: "biology", element: <Biology /> },
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
