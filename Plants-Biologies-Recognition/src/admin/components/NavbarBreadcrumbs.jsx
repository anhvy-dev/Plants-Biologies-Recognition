import * as React from "react";
import { useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Breadcrumbs, { breadcrumbsClasses } from "@mui/material/Breadcrumbs";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  [`& .${breadcrumbsClasses.separator}`]: {
    color: (theme.vars || theme).palette.action.disabled,
    margin: 1,
  },
  [`& .${breadcrumbsClasses.ol}`]: {
    alignItems: "center",
  },
}));

// Map pathnames to page names
const pageNames = {
  "/dashboard": "Home",
  "/account": "Account",
  "/book": "Book",
  "/feedback": "Feedback",
  // Add more routes as needed
};

export default function NavbarBreadcrumbs() {
  const location = useLocation();
  const pageName = pageNames[location.pathname] || "Home";

  return (
    <StyledBreadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextRoundedIcon fontSize="small" />}
    >
      <Typography variant="body1">Admin</Typography>
      <Typography
        variant="body1"
        sx={{ color: "text.primary", fontWeight: 600 }}
      >
        {pageName}
      </Typography>
    </StyledBreadcrumbs>
  );
}
