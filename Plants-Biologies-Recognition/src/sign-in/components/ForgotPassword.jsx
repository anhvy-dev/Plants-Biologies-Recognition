import React, { useState } from "react";
import PropTypes from "prop-types";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import api from "../../config/axios.jsx";

function ForgotPassword({ open, handleClose }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [codeError, setCodeError] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setEmailError(false);

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError(true);
      return;
    }

    setLoading(true);
    try {
      await api.post("Authentication/forgot-password/request", { email });
      setSnackbar({
        open: true,
        message: "Verification email sent! Please check your inbox.",
        severity: "success",
      });
      setStep(2);
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message || "Failed to send verification email.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setCodeError(false);
    setPasswordError(false);

    if (!verificationCode || verificationCode.length < 4) {
      setCodeError(true);
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError(true);
      return;
    }

    setLoading(true);
    try {
      await api.post("Authentication/forgot-password/confirm", {
        email,
        verificationCode,
        newPassword,
      });
      setSnackbar({
        open: true,
        message: "Password reset successful! You can now sign in.",
        severity: "success",
      });
      setStep(1);
      setEmail("");
      setVerificationCode("");
      setNewPassword("");
      handleClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to reset password.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Forgot Password</DialogTitle>
        <DialogContent>
          {step === 1 ? (
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={emailError}
              helperText={emailError ? "Please enter a valid email." : ""}
              sx={{ mt: 2 }}
            />
          ) : (
            <>
              <TextField
                label="Verification Code"
                type="text"
                fullWidth
                required
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                error={codeError}
                helperText={
                  codeError ? "Enter the code sent to your email." : ""
                }
                sx={{ mt: 2 }}
              />
              <TextField
                label="New Password"
                type="password"
                fullWidth
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={passwordError}
                helperText={
                  passwordError ? "Password must be at least 6 characters." : ""
                }
                sx={{ mt: 2 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          {step === 1 ? (
            <Button
              onClick={handleSendEmail}
              variant="contained"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Verification"}
            </Button>
          ) : (
            <Button
              onClick={handleConfirm}
              variant="contained"
              disabled={loading}
            >
              {loading ? "Confirming..." : "Confirm"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
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
    </>
  );
}

ForgotPassword.propTypes = {
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default ForgotPassword;
