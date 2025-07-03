import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import AppTheme from "../shared-theme/AppTheme.jsx";
import SideMenu from "./components/SideMenu.jsx";
import Header from "./components/Header.jsx";
import MainGrid from "./components/MainGrid.jsx";
import AccountGrid from "./components/AccountGrid.jsx";
// import FeedbackGrid from "../dashboard/components/FeedbackGrid.jsx"; // Uncomment if you have this component
import AppNavbar from "./components/AppNavbar.jsx";
import { alpha } from "@mui/material/styles";
import { Routes, Route, Navigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "./theme/customizations/index.jsx";

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function Admin(props) {
  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex" }}>
        <SideMenu />
        <AppNavbar />
        {/* Main content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: "auto",
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: "center",
              mx: 3,
              pb: 5,
              mt: 0,
            }}
          >
            <Header />
            <Outlet />
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
