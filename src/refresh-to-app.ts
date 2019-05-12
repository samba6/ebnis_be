import { EXPERIENCES_URL } from "./routes";
import { SCHEMA_KEY } from "./constants";

/**
 * Wait for a newly created/logged in user to be written to local storage before
 * redirecting user.  On slow systems, we wait for up to 10secs!!!!!!!!!
 */
export function refreshToHome() {
  function getUser() {
    const data = localStorage.getItem(SCHEMA_KEY);

    if (!data) {
      return null;
    }

    try {
      const { ROOT_QUERY } = JSON.parse(data);

      if (!ROOT_QUERY) {
        return null;
      }

      return ROOT_QUERY.user;
    } catch {
      return null;
    }
  }

  if (getUser()) {
    window.location.href = EXPERIENCES_URL;
    return;
  }

  let intervalId: NodeJS.Timeout;
  let counter = 0;

  intervalId = setInterval(() => {
    if (getUser() || counter === 1000) {
      clearInterval(intervalId);
      window.location.href = EXPERIENCES_URL;
    }

    counter++;
  }, 10);
}
