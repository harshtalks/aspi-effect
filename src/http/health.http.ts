import { HttpApiBuilder } from "@effect/platform";
import Api from "../api";
import { Effect } from "effect";

export const httpHealthLive = HttpApiBuilder.group(Api, "health", (handlers) =>
  handlers.pipe(
    HttpApiBuilder.handle("health", () => {
      return Effect.succeed({
        message: "API running successfully",
      });
    }),
  ),
);
