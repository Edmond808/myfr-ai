import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { classifyRequest } from "./server/classify";

function rivlyApiPlugin(): Plugin {
  return {
    name: "rivly-api",
    configureServer(server) {
      server.middlewares.use("/api/classify", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end("Method not allowed");
          return;
        }

        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });
        req.on("end", async () => {
          try {
            const { text, location } = JSON.parse(body) as {
              text: string;
              location: string;
            };
            const result = await classifyRequest(text, location);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(result));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                error:
                  err instanceof Error ? err.message : "Classification failed",
              }),
            );
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), rivlyApiPlugin()],
});
