import { useState, useRef, useCallback } from "react";

export default function useFormError(fadeDuration = 600) {
  const [formError, setFormError] = useState("");
  const [errorFading, setErrorFading] = useState(false);
  const fadeTimer = useRef(null);

  const showError = useCallback((err) => {
    clearTimeout(fadeTimer.current);
    setErrorFading(false);
    setFormError(err || "");
  }, []);

  const clearError = useCallback(() => {
    if (!formError) return;
    setErrorFading(true);
    fadeTimer.current = setTimeout(() => {
      setFormError("");
      setErrorFading(false);
    }, fadeDuration);
  }, [formError, fadeDuration]);

  const zoneClass =
    "heading-error-zone" +
    (formError ? " has-error" : "") +
    (errorFading ? " fading" : "");

  return { formError, errorFading, showError, clearError, zoneClass };
}
