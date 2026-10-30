import { useEffect, useRef, useState } from "react";

const GoogleSignInButton = ({ onCredential }) => {
  const [scriptError, setScriptError] = useState(false);
  const buttonRef = useRef(null);
  const credentialHandlerRef = useRef(onCredential);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  credentialHandlerRef.current = onCredential;

  useEffect(() => {
    if (!clientId) return undefined;
    let active = true;
    let script = document.querySelector('script[data-google-identity="true"]');

    const initializeGoogleSignIn = () => {
      if (!active || !window.google?.accounts?.id || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: ({ credential }) =>
          credentialHandlerRef.current(credential),
      });
      buttonRef.current.replaceChildren();
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        width: buttonRef.current.clientWidth,
      });
    };
    const handleScriptError = () => {
      if (active) setScriptError(true);
    };

    if (window.google?.accounts?.id) {
      initializeGoogleSignIn();
    } else {
      if (!script) {
        script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.dataset.googleIdentity = "true";
      }
      script.addEventListener("load", initializeGoogleSignIn);
      script.addEventListener("error", handleScriptError);
      if (!script.isConnected) document.head.appendChild(script);
    }

    return () => {
      active = false;
      script?.removeEventListener("load", initializeGoogleSignIn);
      script?.removeEventListener("error", handleScriptError);
    };
  }, [clientId]);

  return (
    <>
      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-[#77746D]">
        <span className="h-px flex-1 bg-[#EAE6DF]" />
        <span>or continue with</span>
        <span className="h-px flex-1 bg-[#EAE6DF]" />
      </div>
      {clientId ? (
        <div ref={buttonRef} className="flex min-h-10 justify-center">
          {scriptError && (
            <p className="text-center text-sm text-[#A94F38]" role="alert">
              Google sign-in could not load. Please try again later.
            </p>
          )}
        </div>
      ) : (
        <p className="text-center text-sm text-[#77746D]">
          Google sign-in is not configured.
        </p>
      )}
    </>
  );
};

export default GoogleSignInButton;
