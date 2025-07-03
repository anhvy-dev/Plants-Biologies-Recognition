import * as React from "react";
import Stack from "@mui/material/Stack";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import CustomDatePicker from "./CustomDatePicker.jsx";
import NavbarBreadcrumbs from "./NavbarBreadcrumbs.jsx";
import MenuButton from "./MenuButton.jsx";
import ColorModeIconDropdown from "../../shared-theme/ColorModeIconDropdown.jsx";

import Search from "./Search.jsx";

export default function Header() {
  return (
    <Stack
      direction="row"
      sx={{
        position: "fixed",
        top: 0,
        left: { md: "240px", xs: 0 },
        right: 0,
        zIndex: 1200,
        width: { md: "calc(100vw - 240px)", xs: "100vw" },
        display: { xs: "none", md: "flex" },
        alignItems: "center",
        justifyContent: "space-between",
        maxWidth: { sm: "100%", md: "1700px" },
        pt: 0.5,                // Reduced top padding
        pb: 0.5,                // Add bottom padding for balance
        minHeight: 48,          // Reduce min height (default is 64)
        backgroundColor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
      }}
      spacing={2}
    >
      <NavbarBreadcrumbs />
      <Stack direction="row" sx={{ gap: 1 }}>
        <Search />
        <CustomDatePicker />
        <MenuButton showBadge aria-label="Open notifications">
          <NotificationsRoundedIcon />
        </MenuButton>
        <ColorModeIconDropdown />
      </Stack>
    </Stack>
  );
}
