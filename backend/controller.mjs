import { app } from "./app.mjs";
import * as model from "./model.mjs";

const PORT = process.env.PORT || 5000;

(async () => {
  await model.connect();
  const server = app.listen(PORT, () =>
    console.log(`Server listening on port ${PORT}...`)
  );

  process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully...");
    server.close(() => {
      model.disconnect().then(() => process.exit(0));
    });
  });
})();
