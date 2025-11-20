export const envConfig = () => {
  let redirectURL = "";
  switch (process.env.NODE_ENV) {
    case "staging":
      redirectURL = process.env.STAGING_REDIRECT_URL ?? "";
      break;
    case "production":
      redirectURL = process.env.PRODUCTION_REDIRECT_URL ?? "";
      break;
    case "dev":
      redirectURL = process.env.DEV_REDIRECT_URL ?? "";
      break;
  }
  return redirectURL;
};

export const URLSelect = () => {
  let URL = "";
  switch (process.env.NODE_ENV) {
    case "staging":
      URL = process.env.STAGING_URL ?? "";
      break;
    case "production":
      URL = process.env.PRODUCTION_URL ?? "";
      break;
    case "dev":
      URL = process.env.DEV_URL ?? "";
      break;
  }
  return URL;
};
