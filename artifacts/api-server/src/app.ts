import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Serve the built frontend static files.
// The compiled server sits at artifacts/api-server/dist/index.mjs, so
// ../../passport-maker/dist/public resolves to artifacts/passport-maker/dist/public.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const staticDir = path.resolve(__dirname, "../../passport-maker/dist/public");

app.use(express.static(staticDir));

// SPA fallback — any non-API route returns index.html so client-side routing works.
app.get("*", (_req: Request, res: Response) => {
  res.sendFile(path.join(staticDir, "index.html"));
});

export default app;
