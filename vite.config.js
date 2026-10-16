import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { basename, dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

function localAdminJsonWriter() {
  const coreFiles = new Set([
    "data/home.json",
    "data/about.json",
    "data/shop.json",
    "data/editorial.json",
    "data/admin-settings.json",
  ]);
  const allowedFile = (filePath) => coreFiles.has(filePath)
    || /^data\/products\/[a-z0-9-]+\.json$/i.test(filePath);

  return {
    name: "local-admin-json-writer",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const requestPath = (request.url || "").split("?")[0];
        if (/\/data\/.*\.json$/i.test(requestPath)) {
          response.setHeader("Cache-Control", "no-store");
        }
        if (requestPath !== "/__local-admin/save-json" && requestPath !== "/__local-admin/save-files" && requestPath !== "/__local-admin/upload-image") {
          next();
          return;
        }

        const send = (status, payload) => {
          response.statusCode = status;
          response.setHeader("Content-Type", "application/json; charset=utf-8");
          response.end(JSON.stringify(payload));
        };

        if (request.method !== "POST") {
          send(405, { error: "Use POST to save a JSON file." });
          return;
        }

        try {
          const requestHost = new URL(`http://${request.headers.host || ""}`);
          const origin = request.headers.origin ? new URL(request.headers.origin) : null;
          const localNames = new Set(["localhost", "127.0.0.1", "::1"]);
          const normalizedRequestHost = requestHost.hostname.replace(/^\[|\]$/g, "");
          const normalizedOriginHost = origin?.hostname.replace(/^\[|\]$/g, "");
          if (!localNames.has(normalizedRequestHost)
            || (origin && (normalizedOriginHost !== normalizedRequestHost || origin.port !== requestHost.port))) {
            send(403, { error: "This save action is only available from this local website." });
            return;
          }

          if (requestPath === "/__local-admin/upload-image") {
            const imageTypes = new Map([
              [".png", "image/png"],
              [".jpg", "image/jpeg"],
              [".jpeg", "image/jpeg"],
              [".webp", "image/webp"],
              [".gif", "image/gif"],
              [".avif", "image/avif"],
            ]);
            const encodedName = request.headers["x-upload-name"] || "cardamom-image.png";
            const originalName = decodeURIComponent(Array.isArray(encodedName) ? encodedName[0] : encodedName);
            const extension = extname(basename(originalName)).toLowerCase();
            if (!imageTypes.has(extension) || request.headers["content-type"] !== imageTypes.get(extension)) {
              send(415, { error: "Upload a PNG, JPG, WebP, GIF, or AVIF image." });
              return;
            }

            const chunks = [];
            let bodySize = 0;
            for await (const chunk of request) {
              bodySize += chunk.length;
              if (bodySize > 8 * 1024 * 1024) {
                send(413, { error: "Images must be 8 MB or smaller." });
                return;
              }
              chunks.push(chunk);
            }
            if (bodySize === 0) {
              send(400, { error: "The selected image is empty." });
              return;
            }

            const originalBase = basename(originalName, extension).normalize("NFKD").replace(/[^a-zA-Z0-9-]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase();
            const fileName = `${(originalBase || "cardamom-image").slice(0, 48)}-${Date.now()}${extension}`;
            const uploadsRoot = resolve(projectRoot, "public", "images", "admin-uploads");
            const targetPath = resolve(uploadsRoot, fileName);
            if (!targetPath.startsWith(`${uploadsRoot}${sep}`)) {
              send(400, { error: "That image path is not allowed." });
              return;
            }
            await mkdir(uploadsRoot, { recursive: true });
            await writeFile(targetPath, Buffer.concat(chunks), { flag: "wx" });
            send(200, { path: `/images/admin-uploads/${fileName}` });
            return;
          }

          if (!request.headers["content-type"]?.includes("application/json")) {
            send(415, { error: "Send the JSON content type." });
            return;
          }

          const chunks = [];
          let bodySize = 0;
          for await (const chunk of request) {
            bodySize += chunk.length;
            if (bodySize > 5 * 1024 * 1024) {
              send(413, { error: "The JSON file is too large to save." });
              return;
            }
            chunks.push(chunk);
          }

          const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
          if (!body || typeof body !== "object" || Array.isArray(body)) {
            send(400, { error: "The JSON content must be an object." });
            return;
          }

          if (requestPath === "/__local-admin/save-files") {
            const writes = Array.isArray(body.writes) ? body.writes : [];
            const deletes = Array.isArray(body.deletes) ? body.deletes : [];
            if (!writes.length && !deletes.length) {
              send(400, { error: "There are no project files to save." });
              return;
            }
            if (writes.length + deletes.length > 80) {
              send(400, { error: "Too many files were included in one save." });
              return;
            }

            const publicRoot = resolve(projectRoot, "public");
            const resolvedWrites = writes.map((entry) => {
              if (!entry || typeof entry.path !== "string" || !allowedFile(entry.path)) {
                throw new Error("That content file is not allowed.");
              }
              if (!entry.content || typeof entry.content !== "object" || Array.isArray(entry.content)) {
                throw new Error("Each JSON file must contain an object.");
              }
              const targetPath = resolve(publicRoot, entry.path);
              if (!targetPath.startsWith(`${publicRoot}${sep}`)) throw new Error("That file path is not allowed.");
              return { targetPath, content: entry.content };
            });
            const resolvedDeletes = deletes.map((relativePath) => {
              if (typeof relativePath !== "string" || !/^data\/products\/[a-z0-9-]+\.json$/i.test(relativePath)) {
                throw new Error("Only product detail files can be removed.");
              }
              const targetPath = resolve(publicRoot, relativePath);
              if (!targetPath.startsWith(`${publicRoot}${sep}`)) throw new Error("That file path is not allowed.");
              return targetPath;
            });

            for (const { targetPath, content } of resolvedWrites) {
              await writeFile(targetPath, `${JSON.stringify(content, null, 2)}\n`, "utf8");
            }
            for (const targetPath of resolvedDeletes) await rm(targetPath, { force: true });
            send(200, { saved: writes.map((entry) => entry.path), deleted: deletes });
            return;
          }

          if (typeof body.path !== "string" || !allowedFile(body.path)) {
            send(400, { error: "That content file is not allowed." });
            return;
          }
          if (!body.content || typeof body.content !== "object" || Array.isArray(body.content)) {
            send(400, { error: "The JSON content must be an object." });
            return;
          }

          const publicRoot = resolve(projectRoot, "public");
          const targetPath = resolve(publicRoot, body.path);
          if (!targetPath.startsWith(`${publicRoot}${sep}`)) {
            send(400, { error: "That file path is not allowed." });
            return;
          }

          await writeFile(targetPath, `${JSON.stringify(body.content, null, 2)}\n`, "utf8");
          send(200, { saved: body.path });
        } catch (error) {
          send(400, { error: error.message || "The JSON file could not be saved." });
        }
      });
    },
  };
}

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const base = process.env.GITHUB_ACTIONS && repositoryName
  ? `/${repositoryName}/`
  : "/";

export default defineConfig({
  plugins: [react(), localAdminJsonWriter()],
  base,
});
