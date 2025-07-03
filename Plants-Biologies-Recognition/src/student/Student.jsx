import * as React from "react";
import {
  CssBaseline,
  Container,
  Typography,
  Box,
  Stack,
  Link,
  Button,
} from "@mui/material";
import AndroidIcon from "@mui/icons-material/Android";
import AppleIcon from "@mui/icons-material/Apple";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../(auth)/store";
import QrCodeMobileApp from "../assets/Rickrolling_QR_code.png";

export default function Student() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleBackToSignIn = () => {
    logout();
    navigate("/sign-in");
  };

  return (
    <>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ paddingTop: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          This website version is intended for <b>Teachers</b> and{" "}
          <b>Administrators</b> only.
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 3 }}>
          If you are a <b>Student</b>, please scan the QR code below or visit the
          links provided to <b>download the mobile version</b> designed
          specifically for students.
        </Typography>
        <Box display="flex" justifyContent="center" mb={3}>
          <img
            src={QrCodeMobileApp}
            alt="Student App QR Code"
            style={{ width: 180, height: 180 }}
          />
        </Box>
        <Stack direction="row" spacing={4} justifyContent="center">
          <Link
            href="https://play.google.com/store"
            target="_blank"
            underline="none"
          >
            <Box display="flex" flexDirection="column" alignItems="center">
              <AndroidIcon sx={{ fontSize: 40, color: "#3ddc84" }} />
              <Typography variant="caption">Android</Typography>
            </Box>
          </Link>
          <Link
            href="https://www.apple.com/app-store/"
            target="_blank"
            underline="none"
          >
            <Box display="flex" flexDirection="column" alignItems="center">
              <AppleIcon sx={{ fontSize: 40, color: "#000" }} />
              <Typography variant="caption">iOS</Typography>
            </Box>
          </Link>
        </Stack>
        <Box display="flex" justifyContent="center" mt={4}>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleBackToSignIn}
          >
            Back to Sign In page
          </Button>
        </Box>
      </Container>
    </>
  );
}
