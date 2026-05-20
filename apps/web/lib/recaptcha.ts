declare global {
  interface Window {
    grecaptcha?: any;
  }
}

/**
 * Executes a specific reCAPTCHA v3 action and returns the verification token.
 * Returns undefined if reCAPTCHA is not configured or fails to load.
 */
export async function executeReCaptcha(action: string): Promise<string | undefined> {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey) {
    console.warn("reCAPTCHA site key is not configured. Skipping reCAPTCHA execution.");
    return undefined;
  }

  if (typeof window === "undefined") {
    return undefined;
  }

  // Helper to wait for window.grecaptcha to be defined
  const getGrecaptcha = (): Promise<any> => {
    return new Promise((resolve) => {
      if (window.grecaptcha) {
        resolve(window.grecaptcha);
        return;
      }

      const interval = setInterval(() => {
        if (window.grecaptcha) {
          clearInterval(interval);
          resolve(window.grecaptcha);
        }
      }, 100);

      // Timeout after 4 seconds
      setTimeout(() => {
        clearInterval(interval);
        resolve(null);
      }, 4000);
    });
  };

  const grecaptcha = await getGrecaptcha();
  if (!grecaptcha) {
    console.error("reCAPTCHA failed to load in time.");
    return undefined;
  }

  // Use Enterprise API if available, otherwise fallback to Standard v3
  const isEnterprise = !!grecaptcha.enterprise;
  const recaptchaInstance = isEnterprise ? grecaptcha.enterprise : grecaptcha;
  
  // Enterprise action names are typically uppercase (e.g. 'LOGIN' or 'REGISTER')
  const formattedAction = isEnterprise ? action.toUpperCase() : action;

  return new Promise((resolve) => {
    recaptchaInstance.ready(() => {
      recaptchaInstance
        .execute(siteKey, { action: formattedAction })
        .then((token: string) => {
          resolve(token);
        })
        .catch((err: any) => {
          console.error("reCAPTCHA execution error:", err);
          resolve(undefined);
        });
    });
  });
}
