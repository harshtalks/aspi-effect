// health api

import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform";
import { Schema } from "@effect/schema";

export class HealthApi extends HttpApiGroup.make("health").pipe(
  HttpApiGroup.add(
    HttpApiEndpoint.get("health", "/health").pipe(
      HttpApiEndpoint.setSuccess(
        Schema.Struct({
          message: Schema.NonEmptyString,
        }),
      ),
    ),
  ),
) {}
