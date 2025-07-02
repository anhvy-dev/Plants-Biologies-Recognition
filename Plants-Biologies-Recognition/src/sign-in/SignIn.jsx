// Những phần import giữ nguyên

export default function SignIn(props) {
  const navigate = useNavigate();
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState("");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError("");
    if (!validateInputs()) {
      return;
    }
    const data = new FormData(event.currentTarget);
    const account = data.get("account");
    const password = data.get("password");

    setLoading(true);
    try {
      await api.post("Authentication/login", {
        account,
        password,
      });
      navigate("/dashboard");
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setApiError("Invalid account or password.");
      } else {
        setApiError(
          error.response?.data?.message ||
          "Sign in failed. Please check your credentials."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const validateInputs = () => {
    const password = document.getElementById("password");
    let isValid = true;

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must be at least 6 characters long.");
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    return isValid;
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" justifyContent="space-between">
        <ColorModeSelect sx={{ position: "fixed", top: "1rem", right: "1rem" }} />
        <Card variant="outlined">
          <Box sx={{ display: "flex", justifyContent: "left" }}>
            <img
              src={PlantLogo}
              alt="Plant Biology Education"
              style={{
                height: 30,
                marginBottom: 4,
                objectFit: "cover",
                borderRadius: 8,
                width: "auto",
                maxWidth: "100%",
              }}
            />
          </Box>
          <Typography component="h1" variant="h4" sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)", mt: 0 }}>
            Sign in
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 2 }}>
            <FormControl>
              <FormLabel htmlFor="account" sx={{ textAlign: "left" }}>
                Account
              </FormLabel>
              <TextField
                id="account"
                type="text"
                name="account"
                placeholder="Username"
                autoComplete="account"
                autoFocus
                required
                fullWidth
                variant="outlined"
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password" sx={{ textAlign: "left" }}>
                Password
              </FormLabel>
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="current-password"
                required
                fullWidth
                variant="outlined"
                color={passwordError ? "error" : "primary"}
              />
            </FormControl>
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            <ForgotPassword open={open} handleClose={handleClose} />
            {apiError && (
              <Typography color="error" sx={{ mt: 1 }}>
                {apiError}
              </Typography>
            )}
            <Button type="submit" fullWidth variant="contained" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            <Link component="button" type="button" onClick={handleClickOpen} variant="body2" sx={{ alignSelf: "center" }}>
              Forgot your password?
            </Link>
          </Box>
          <Divider>or</Divider>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button fullWidth variant="outlined" onClick={() => alert("Sign in with Google")} startIcon={<GoogleIcon />}>
              Sign in with Google
            </Button>
            <Typography sx={{ textAlign: "center" }}>
              Don&apos;t have an account?{" "}
              <Link component={RouterLink} to="/sign-up" variant="body2" sx={{ alignSelf: "center" }}>
                Sign up
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignInContainer>
    </AppTheme>
  );
}
