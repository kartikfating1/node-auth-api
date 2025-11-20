import dotenv from "dotenv";
dotenv.config();

const getUser = () => {
  let User = "";
  switch (process.env.NODE_ENV) {
    case "staging":
      User = process.env.STAG_USER ?? "";
      break;
    case "production":
      User = process.env.PROD_USER ?? "";
      break;
    case "dev":
      User = process.env.DEV_USER ?? "";
      break;
  }
  return User;
};

const getPass = () => {
  let Pass = "";
  switch (process.env.NODE_ENV) {
    case "staging":
      Pass = process.env.STAG_PASS ?? "";
      break;
    case "production":
      Pass = process.env.PROD_PASS ?? "";
      break;
    case "dev":
      Pass = process.env.DEV_PASS ?? "";
      break;
  }
  return Pass;
};

const getURL = () => {
  let url = "";
  switch (process.env.NODE_ENV) {
    case "staging":
      url = process.env.STAG_MONGO_URL ?? "";
      break;
    case "production":
      url = process.env.PROD_MONGO_URL ?? "";
      break;
    case "dev":
      url = process.env.DEV_MONGO_URL ?? "";
      break;
  }
  return url;
};

export const appConstants = {
  emailRegex: /([a-zA-Z0-9]+)([.]?)([a-zA-Z0-9]+)@([a-zA-Z0-9]+)([.])com/g,
  HOME: "Welcome to the Home Page!",
  SERVER_RUN: `Server is running on http://localhost:`,
  ACCESS_CONTROL: "Access-Control-Allow-Headers",
  TOKEN_CONTENT_TYPE: "x-access-token, Origin, Content-Type, Accept",
  BUCKET_NAME: "images-hranalytics",
  PATH_PATTERN: /^https?:\/\/(?:[^/]+)\/([^?]+)/,
  MONGO_DB: `mongodb://${getUser() || "demo2"}:${getPass() || "demo1234"}@${getURL()||"mongodb-qa.myapp-qa.svc.clster.local:27017"}`,

  authSource: "admin",
  user: getUser(),
  pass: getPass(),
  environment: {
    DEV: "dev",
    STAGING: "staging",
    PRODUCTION: "production",
  },

  CORS_OPTIONS: {
    origin: "*",

    methods: ["POST", "GET", "PUT", "DELETE"],

    allowedHeaders: ["Content-Type"],
  },
  regexPatterns: {
    NUM_PATTERN: /^[1-9]\d*$/,
    NAME_PATTERN:
      /([a-zA-Z0-9]+)(\.[a-zA-Z0-9]+)*@([a-zA-Z0-9]+\.)+[a-zA-Z]{2,}(\.[a-zA-Z]{2,})*/g,
    EXP_PATTERN: /^(0|\d+(\.\d+)?)$/,
  },
  nodeMailer: {
    HOST: "smtp.office365.com",
    USER: "noreply@caxsol.com",
    PWD: "Caxsol#2022",
  },
  userSync: {
    ADMIN: "Admin",
  },
};
