const APP_ORIGIN = "https://megakart.local";

export const getCurrentRoute = ({ pathname, search, hash }) =>
  `${pathname}${search}${hash}`;

export const getPostAuthDestination = (redirect) => {
  if (redirect === "checkout") return "/checkout";
  if (!redirect?.startsWith("/") || redirect.startsWith("//")) return "/";

  const destination = new URL(redirect, APP_ORIGIN);
  if (
    destination.origin !== APP_ORIGIN ||
    destination.pathname === "/login" ||
    destination.pathname === "/register"
  ) {
    return "/";
  }

  return `${destination.pathname}${destination.search}${destination.hash}`;
};

export const getLoginUrl = (destination) =>
  `/login?${new URLSearchParams({ redirect: destination })}`;
