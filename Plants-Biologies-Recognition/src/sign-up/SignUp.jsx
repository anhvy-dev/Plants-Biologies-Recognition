import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import AppTheme from "../shared-theme/AppTheme.jsx";
import ColorModeSelect from "../shared-theme/ColorModeSelect.jsx";
import { GoogleIcon, FacebookIcon } from "./components/CustomIcons.jsx";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import api from "../config/axios.jsx";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import PlantLogo from "../assets/plant-biology-education-high-resolution-logo.png";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import GoogleSignUp from "./components/GoogleSignUp.jsx";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  [theme.breakpoints.up("sm")]: {
    width: "450px",
  },
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  minHeight: "100%",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage:
      "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
    backgroundRepeat: "no-repeat",
    ...theme.applyStyles("dark", {
      backgroundImage:
        "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    }),
  },
}));

export default function SignUp(props) {
  const navigate = useNavigate();
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState("");
  const [apiSuccess, setApiSuccess] = React.useState("");
  const [accountError, setAccountError] = React.useState(false);
  const [accountErrorMessage, setAccountErrorMessage] = React.useState("");
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("");
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Only allow Student role
  const role = "Student";

  const validateInputs = () => {
    const password = document.getElementById("password");
    const name = document.getElementById("name");
    const account = document.getElementById("account");
    const email = document.getElementById("email");

    let isValid = true;

    if (!account.value || account.value.length < 3) {
      setAccountError(true);
      setAccountErrorMessage("Account must be at least 3 characters.");
      isValid = false;
    } else {
      setAccountError(false);
      setAccountErrorMessage("");
    }

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage("Valid email is required.");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must be at least 6 characters long.");
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    if (!name.value || name.value.length < 1) {
      setNameError(true);
      setNameErrorMessage("Name is required.");
      isValid = false;
    } else {
      setNameError(false);
      setNameErrorMessage("");
    }

    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError("");
    setApiSuccess("");
    if (!validateInputs()) {
      return;
    }
    const data = new FormData(event.currentTarget);
    const fullName = data.get("name");
    const account = data.get("account");
    const email = data.get("email");
    const password = data.get("password");

    try {
      setLoading(true);
      await api.post("Authentication/register", {
        account,
        email,
        password,
        role,
        fullName,
        isActive: true,
      });
      setApiSuccess("Registration successful! You can now sign in.");
      setSnackbar({
        open: true,
        message: "Registration successful! Redirecting to sign in...",
        severity: "success",
      });
      setTimeout(() => {
        navigate("/sign-in");
      }, 3000);
    } catch (error) {
      setApiError(
        error.response?.data?.message ||
          "Registration failed. Please check your information."
      );
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message ||
          "Registration failed. Please check your information.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Google sign up handlers
  const [googleLoading, setGoogleLoading] = React.useState(false);

  const handleGoogleSuccess = () => {
    setApiSuccess("Registration successful with Google! You can now sign in.");
    setSnackbar({
      open: true,
      message: "Registration successful! Redirecting to sign in...",
      severity: "success",
    });
    setTimeout(() => {
      navigate("/sign-in");
    }, 3000);
  };

  const handleGoogleError = (error) => {
    setApiError(
      error.response?.data?.message ||
        error.message ||
        "Google registration failed."
    );
    setSnackbar({
      open: true,
      message:
        error.response?.data?.message ||
        error.message ||
        "Google registration failed.",
      severity: "error",
    });
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <ColorModeSelect sx={{ position: "fixed", top: "1rem", right: "1rem" }} />
      <SignUpContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <Box sx={{ display: "flex", justifyContent: "left" }}>
            <img
              src={PlantLogo}
              alt="Plant Biology Education"
              style={{
                height: 30, // decrease logo height
                marginBottom: 4,
                objectFit: "cover", // crop the image if needed
                borderRadius: 8, // optional: rounded corners for a cleaner crop
                width: "auto",
                maxWidth: "100%",
              }}
            />
          </Box>
          <Typography
            component="h1"
            variant="h4"
            sx={{
              width: "100%",
              fontSize: "clamp(2rem, 10vw, 2.15rem)",
              mt: 0,
            }}
          >
            Sign up
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <FormControl>
              <FormLabel htmlFor="name" sx={{ textAlign: "left" }}>
                Full name
              </FormLabel>
              <TextField
                autoComplete="name"
                name="name"
                required
                fullWidth
                id="name"
                placeholder="Jon Snow"
                error={nameError}
                helperText={nameErrorMessage}
                color={nameError ? "error" : "primary"}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="account" sx={{ textAlign: "left" }}>
                Username
              </FormLabel>
              <TextField
                required
                fullWidth
                id="account"
                placeholder="Username"
                name="account"
                autoComplete="username"
                variant="outlined"
                error={accountError}
                helperText={accountErrorMessage}
                color={accountError ? "error" : "primary"}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="email" sx={{ textAlign: "left" }}>
                Email
              </FormLabel>
              <TextField
                required
                fullWidth
                id="email"
                placeholder="Email"
                name="email"
                autoComplete="email"
                variant="outlined"
                error={emailError}
                helperText={emailErrorMessage}
                color={emailError ? "error" : "primary"}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password" sx={{ textAlign: "left" }}>
                Password
              </FormLabel>
              <TextField
                required
                fullWidth
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="new-password"
                variant="outlined"
                error={passwordError}
                helperText={passwordErrorMessage}
                color={passwordError ? "error" : "primary"}
              />
            </FormControl>
            {apiError && (
              <Typography color="error" sx={{ mt: 1 }}>
                {apiError}
              </Typography>
            )}
            {apiSuccess && (
              <Typography color="success.main" sx={{ mt: 1 }}>
                {apiSuccess}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign up"}
            </Button>
          </Box>
          <Divider>
            <Typography sx={{ color: "text.secondary" }}>or</Typography>
          </Divider>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <GoogleSignUp
              loading={googleLoading}
              setLoading={setGoogleLoading}
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
            <Typography sx={{ textAlign: "center" }}>
              Already have an account?{" "}
              <Link
                component={RouterLink}
                to="/sign-in"
                href="/material-ui/getting-started/templates/sign-in/"
                variant="body2"
                sx={{ alignSelf: "center" }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Card>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <MuiAlert
            elevation={6}
            variant="filled"
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </MuiAlert>
        </Snackbar>
      </SignUpContainer>
    </AppTheme>
  );
}
