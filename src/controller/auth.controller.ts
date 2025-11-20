import passport from "passport";
import { OIDCStrategy } from "passport-azure-ad";
import dotenv from "dotenv";
import { authService } from "../services/auth.service";
dotenv.config();
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { messageConstants } from "../constants/messageConstants";
import { envConfig, URLSelect } from "../helpers/redirectURLSelector";
import customLogger from "../config/logger";
import * as crypto from "crypto";
const logger = customLogger();

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user: any, done) {
  done(null, user);
});

const clientID = process.env.CLIENT_ID as string;
const metaData = process.env.IDENTITY_METADATA as string;
const secretKey = process.env.SECRETKEY as string;

const encryptData = (data: any, secretKey: string) => {
  const key = crypto.createHash("sha256").update(secretKey, "utf-8").digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(JSON.stringify(data), "utf-8", "base64");
  encrypted += cipher.final("base64");
  return iv.toString("hex") + ":" + encrypted;
};

passport.use(
  new OIDCStrategy(
    {
      identityMetadata: metaData,
      clientID: clientID,
      responseType: "code id_token",
      responseMode: "form_post",
      redirectUrl: envConfig(),
      allowHttpForRedirectUrl: true,
      clientSecret: process.env.CLIENT_SECRET,
      validateIssuer: false,
      passReqToCallback: true,
      scope: ["openid", "profile", "offline_access"],
    },
    (
      _req: Request,
      _iss: unknown,
      _sub: unknown,
      profile: unknown,
      _access_token: unknown,
      _refresh_token: unknown,
      _params: unknown,
      done: (error: unknown, user?: unknown, options?: unknown) => void
    ) => {
      done(null, profile);
    }
  )
);

export const azureLogin = (req: Request, res: Response) => {
  if (!req.query || !req.query.state) {
    logger.error("Azure login error: Missing state parameter");
    return res.redirect("http://localhost:8080/dev/login?error=unauthorized");
  }
  // passport.authenticate("azuread-openidconnect")(req, res, next);
};

export const azureRedirect = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    "azuread-openidconnect",
    async (err: string, user: any) => {
      if (err) {
        logger.error("Azure login error: " + err);
        return res.redirect(URLSelect() + "login?error=unauthorized_user");
      }

      if (!user) {
        return res.redirect(
          "http://localhost:8080/dev/login?error=unauthorized_user"
        );
      }

      try {
        const username = user._json.unique_name;
        const userData = await authService.login(username);

        if (!userData || Object.keys(userData).length === 0) {
          return res.redirect(
            "http://localhost:8080/dev/login?error=unauthorized_user"
          );
        }

        const encryptedUserData = encryptData(userData, secretKey);
        return res.redirect(
          URLSelect() +
            "login/ssoLogin/" +
            encodeURIComponent(encryptedUserData)
        );
      } catch (error) {
        logger.error("Azure callback exception: " + error);
        return res.redirect(
          "http://localhost:8080/dev/login?error=unauthorized_user"
        );
      }
    }
  )(req, res, next);
};

export const azureFailure = (_req: Request, res: Response) => {
  return res.redirect(
    "http://localhost:8080/dev/login?error=unauthorized_user"
  );
};

export const login = async (req: Request, res: Response) => {
  const username = req.body.username;
  try {
    const userDetails = await authService.login(username);
    if (!userDetails || Object.keys(userDetails).length === 0) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send({ message: messageConstants.authService.NO_USER });
    }
    res.status(StatusCodes.OK).send(userDetails);
  } catch (error) {
    logger.error(messageConstants.Auth.LOGIN_ERR + error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: messageConstants.failure.INT_SERVER_ERR });
  }
};

export const verifyTokenController = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: messageConstants.Auth.TOKEN_REQ });
    }

    const result = await authService.verifyTokenAndMatchIds(token);
    res.status(result.status).json({ message: result.message });
  } catch (error) {
    logger.error(messageConstants.Auth.TOKEN_ERR + error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: messageConstants.failure.INT_SERVER_ERR });
  }
};
