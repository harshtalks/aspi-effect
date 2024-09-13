import {
  HttpApiBuilder,
  HttpApiSwagger,
  HttpMiddleware,
  HttpServer,
} from "@effect/platform";
import Api from "./api";
import { Layer } from "effect";
import { httpAccountsLive } from "./http/accounts.http";
import { httpGroupsLive } from "./http/groups.http";
import { httpPeopleLive } from "./http/people.http";
import { NodeHttpServer } from "@effect/platform-node";
import { createServer } from "http";
import { httpHealthLive } from "./http/health.http";

export const contractLive = HttpApiBuilder.api(Api).pipe(
  Layer.provide(httpAccountsLive),
  Layer.provide(httpGroupsLive),
  Layer.provide(httpPeopleLive),
  Layer.provide(httpHealthLive),
);

export const httpLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(HttpApiSwagger.layer()),
  Layer.provide(HttpApiBuilder.middlewareCors()),
  Layer.provide(contractLive),
  HttpServer.withLogAddress,
  Layer.provide(
    NodeHttpServer.layer(createServer, {
      port: 3000,
    }),
  ),
);
