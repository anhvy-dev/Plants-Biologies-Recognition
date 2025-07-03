import * as React from "react";

import { alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import AppNavbar from "./components/AppNavbar.js";
import SideMenu from "./components/SideMenu.js";
import Header from "./components/Header.js";
import AppTheme from "../shared-theme/AppTheme.js";
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "./theme/customizations/index.js";
import AccountGrid from "./components/AccountGrid.js";

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function Account(props) {
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
            {/* Account Grid */}
            <AccountGrid />
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
