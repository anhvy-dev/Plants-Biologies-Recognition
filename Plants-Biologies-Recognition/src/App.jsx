import React from "react";
import { Outlet, RouterProvider } from "react-router-dom";
import { useRoutes } from "react-router-dom";

import LandingPage from "./landing-page/LandingPage";
import Signin from "./sign-in/SignIn";
import Signup from "./sign-up/SignUp";

import Admin from "./admin/Admin";
import Account from "./admin/components/AccountGrid";
import Dashboard from "./admin/components/MainGrid";
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
import TeacherBiology from "./teacher/components/TeacherBiologyGrid";

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
      path: "sign-in",
      element: <Signin />,
    },
    {
      path: "sign-up",
      element: <Signup />,
    },
    {
      path: "student",
      element: <Student />,
      accessKey: "Student",
    },
    {
      path: "teacher",
      element: <Teacher />,
      accessKey: "Teacher",
      children: [
        { index: true, element: <Report /> }, // /teacher goes to Report
        { path: "report", element: <Report /> },
        { path: "book", element: <TeacherBook /> },
        { path: "chapter", element: <TeacherChapter /> },
        { path: "lesson", element: <TeacherLesson /> },
        { path: "biology", element: <TeacherBiology /> },
      ],
    },
    {
      path: "admin",
      element: <Admin />,
      accessKey: "Admin",
      children: [
        { index: true, element: <Dashboard /> }, // /admin goes to Dashboard
        { path: "dashboard", element: <Dashboard /> },
        { path: "account", element: <Account /> },
        { path: "book", element: <Book /> },
        { path: "chapter", element: <Chapter /> },
        { path: "lesson", element: <Lesson /> },
        { path: "biology", element: <Biology /> },
      ],
    },
    {
      path: "*",
      element: <>Page not found</>,
    },
  ];

  const content = useRoutes(
    createRoutes({ routes: router, userRole: authUser?.role })
  );
  return content;
  // return <RouterProvider router={router} />;
};

export default App;
