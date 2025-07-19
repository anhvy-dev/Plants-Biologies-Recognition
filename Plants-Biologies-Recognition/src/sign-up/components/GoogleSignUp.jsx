import React from "react";
import {
  loadGoogleScript,
  renderGoogleButton,
} from "../../config/googleConsole.jsx";
import api from "../../config/axios.jsx";
import { GoogleIcon } from "./CustomIcons.jsx";

export default function GoogleSignUp({ onSuccess, onError, setLoading }) {
  const googleButtonRef = React.useRef(null);

  React.useEffect(() => {
    loadGoogleScript().then(() => {
      if (googleButtonRef.current) {
        renderGoogleButton({
          elementId: "google-signup-btn",
          onSuccess: async (idToken) => {
            setLoading(true);
            try {
              const res = await api.post("Authentication/google-signin", {
                idToken,
              });
              if (onSuccess) onSuccess(res.data);
            } catch (error) {
              if (onError) onError(error);
            } finally {
              setLoading(false);
            }
          },
          onError: (err) => {
            if (onError) onError(err || "Google sign-up failed.");
          },
        });
      }
    });
  }, []);

  return (
    <div style={{ width: "100%" }}>
      <div id="google-signup-btn" ref={googleButtonRef} />
    </div>
  );
}
