import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { appConstants } from "./constants/appConstants";
import { messageConstants } from "./constants/messageConstants";
// import authRoute from "./routes/auth.route";
import { db } from "./config/db.config";
import { userSyncRoutes } from "./routes/userSync.route";
import { roleRoutes } from "./routes/role.route";
import { moduleRoutes } from "./routes/module.route";
import { IModuleMaster } from "./models/modulemasters";
import { moduleMasterService } from "./services/moduleMaster.service";
import session from "express-session";
import expressJSDocSwagger from "express-jsdoc-swagger";
import { v4 as uuidv4 } from "uuid";
import { permissionService } from "./services/permission.service";
import { IPermission } from "./models/permissions";
import customLogger from "./config/logger";
import { IRole } from "./models/roles";
import { roleService } from "./services/role.service";
import MongoStore from "connect-mongo";

const logger = customLogger();

dotenv.config();
const app = express();

const envPrefix = process.env.NODE_ENV || "dev";
const getEnvironment = (): string => {
  switch (process.env.NODE_ENV) {
    case "staging":
      return "/qa";
    case "production":
      return "";
    case "dev":
    case "development":
      return "/dev";
    default:
      return "/dev";
  }
};

const basePath = `${getEnvironment()}/auth`;

app.use(cors(appConstants.CORS_OPTIONS));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  app.set("trust proxy", 1);

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "your-secret-key",
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: appConstants.MONGO_DB,
        collectionName: "sessions",
        ttl: 14 * 24 * 60 * 60, // 14 days
      }),
      cookie: {
        secure: true, // Ensures cookies are only sent over HTTPS
        httpOnly: true,
        sameSite: "none", // Required for cross-site cookies
        maxAge: 1000 * 60 * 60 * 24, // 1 day
      },
    })
  );
} else {
  app.use(
    session({
      secret: "your-secret-key",
      resave: false,
      saveUninitialized: true,
    })
  );
}

//authRoute(app);

const options = {
  info: {
    version: "1.0.0",
    title: "AuthZ",
    description:
      "AuthZ is a backend service for People Analytics. It manages user roles, modules and user access to particular modules within this application.",
    license: {
      name: "Caxsol",
    },
  },
  security: {
    BearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    },
  },
  //
  baseDir: __dirname,
  filesPattern: "./**/*.ts",
  swaggerUIPath: `${basePath}/api-docs`,
  exposeSwaggerUI: true,
  exposeApiDocs: false,
  apiDocsPath: "/v3/api-docs",
  notRequiredAsNullable: false,
  swaggerUiOptions: {},
  multiple: true,
};

app.get(basePath, (req, res) => {
  res.send(`Welcome to the AuthZ API - ${envPrefix.toUpperCase()} Environment`);
});

app.get("/", (req, res) => {
  res.redirect(`${basePath}/api-docs`);
});
app.get("/health", (req, res) => {
  res.status(200).json({ status: "true", message: "AuthZ service is running" });
});
roleRoutes(app);
moduleRoutes(app);
userSyncRoutes(app);

expressJSDocSwagger(app)(options);
app
  .listen(process.env.PORT, () => {
    logger.info(`Server running on port ${process.env.PORT}`);
    logger.info(`Environment: ${envPrefix}`);
    logger.info(`Swagger available at: ${basePath}/api-docs`);
  })
  .on("error", (err) => {
    logger.error(err + messageConstants.SERVER_FAIL);
  });

db.connectToDb((err: Error | null) => {
  if (err) {
    logger.error(messageConstants.failure.DB_CONN_FAIL);
  } else {
    defaultModule();
    defaultRole();
  }
});

async function defaultModule() {
  const moduleNames = [
    {
      moduleId: messageConstants.module.ONE,
      moduleName: messageConstants.module.ACCESS_CONTROL,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      moduleId: messageConstants.module.TWO,
      moduleName: messageConstants.module.ADMIN_DASHBOARD,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      moduleId: messageConstants.module.THREE,
      moduleName: messageConstants.module.HR_DASHBOARD,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      moduleId: messageConstants.module.FOUR,
      moduleName: messageConstants.module.LEAVE_HOLIDAY_POLICY,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      moduleId: messageConstants.module.FIVE,
      moduleName: messageConstants.module.SURVEY,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      moduleId: messageConstants.module.SIX,
      moduleName: messageConstants.module.USER_DAHSBOARD,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      moduleId: messageConstants.module.SEVEN,
      moduleName: messageConstants.module.USER_PROFILE,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      moduleId: messageConstants.module.EIGHT,
      moduleName: messageConstants.module.PROFILE_MODULE,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  try {
    for (const moduleData of moduleNames) {
      const existingModule = await moduleMasterService.getModuleById(
        moduleData.moduleId
      );
      if (!existingModule) {
        const moduleItems: IModuleMaster = moduleData as IModuleMaster;
        await moduleMasterService.createModule(moduleItems);
      }
    }
  } catch (error) {
    logger.error(messageConstants.module.MODULE_CREATION_ERR + error);
  }
}

async function defaultRole() {
  try {
    const existingRole = await roleService.getRoleByName(
      messageConstants.Role.DEFAULT_ROLE
    );
    if (existingRole) {
      logger.info(messageConstants.Role.DEFAULT_ROLE_EXISTS);
      return;
    }

    const roleItemsData = {
      roleId: uuidv4(),
      name: messageConstants.Role.DEFAULT_ROLE,
      updatedAt: new Date(),
    };
    const roleItems: IRole = roleItemsData as IRole;
    const createdRole = await roleService.createRole(roleItems);

    const profileModuleId = messageConstants.module.EIGHT;
    const permissionItemsData = {
      permissionId: uuidv4(),
      create: true,
      read: true,
      update: true,
      delete: true,
      roleId: createdRole.roleId,
      moduleId: profileModuleId,
      updatedAt: new Date(),
    };
    const permissionItems: IPermission = permissionItemsData as IPermission;
    await permissionService.createPermission(permissionItems);

    logger.info(messageConstants.Role.DEFAULT_ROLE_CREATED);
  } catch (error) {
    logger.error(messageConstants.Role.DEFAULT_ROLE_CREATE_ERR + error);
  }
}
