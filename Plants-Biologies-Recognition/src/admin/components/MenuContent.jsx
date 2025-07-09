import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import HelpRoundedIcon from "@mui/icons-material/HelpRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import BookmarksRoundedIcon from "@mui/icons-material/BookmarksRounded";
import MenuButton from "./MenuButton";

const mainListItems = [
  { text: "Home", icon: <HomeRoundedIcon />, path: "/dashboard" },
  { text: "Account", icon: <PeopleRoundedIcon />, path: "/account" },
  { text: "Book", icon: <MenuBookRoundedIcon />, path: "/book" },
  { text: "Chapter", icon: <BookmarksRoundedIcon />, path: "/chapter" },
  { text: "Feedback", icon: <AssignmentRoundedIcon />, path: "/feedback" },
];

const secondaryListItems = [
  { text: "Settings", icon: <SettingsRoundedIcon /> },
  { text: "About", icon: <InfoRoundedIcon /> },
  { text: "Feedback", icon: <HelpRoundedIcon /> },
];

export default function MenuContent() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      <List dense>
        {mainListItems.map((item, index) => {
          const selected = item.path && location.pathname === item.path;
          return (
            <ListItem key={index} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                selected={selected}
                onClick={() => item.path && navigate(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: "block" }}>
            <ListItemButton>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
