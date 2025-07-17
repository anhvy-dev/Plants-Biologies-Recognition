import React from "react";
import Button from "@mui/material/Button";
import { GoogleIcon } from "./CustomIcons.jsx";
import api from "../../config/axios.jsx";
import { signUpWithGoogle } from "../../config/firebase.jsx";

export default function GoogleSignUp({
  onSuccess,
  onError,
  loading,
  setLoading,
}) {
  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      // Use the helper from firebase config
      const { idToken } = await signUpWithGoogle();
      const res = await api.post("Authentication/google", { idToken });
      if (onSuccess) onSuccess(res.data);
    } catch (error) {
      if (onError) onError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      fullWidth
      variant="outlined"
      onClick={handleGoogleSignUp}
      startIcon={<GoogleIcon />}
      disabled={loading}
    >
      {loading ? "Signing up..." : "Sign up with Google"}
    </Button>
  );
}
