// Google OAuth2 client config for browser
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;

// Loads Google Identity Services script and triggers sign-in
export function loadGoogleScript() {
  return new Promise((resolve) => {
    if (document.getElementById("google-client-script")) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.id = "google-client-script";
    script.onload = resolve;
    document.body.appendChild(script);
  });
}

// Render Google Sign-In button and handle callback
export function renderGoogleButton({ elementId, onSuccess, onError }) {
  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (response) => {
      if (response.credential) {
        onSuccess(response.credential);
      } else {
        onError("No credential received");
      }
    },
  });
  window.google.accounts.id.renderButton(document.getElementById(elementId), {
    theme: "outline",
    size: "large",
  });
  window.google.accounts.id.prompt();
}
