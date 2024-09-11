import { Context, Effect, Layer } from "effect";
import { ContextTags } from "./tags";
import { SqlClient, SqlSchema } from "@effect/sql";
import { Model } from "@effect/sql";
import { User } from "../domains/user";
import { AccessToken } from "../domains/redacted";
import { MakeService } from "../utilities/with-effect";
import { sqlLive } from "../requirements/sql";

const makeUsersRepo = Effect.all([
  SqlClient.SqlClient,
  Model.makeRepository(User, {
    tableName: "users",
    spanPrefix: "UsersRepo",
    idColumn: "id",
  }),
]).pipe(
  Effect.andThen(([sql, repo]) => {
    const findByAccessTokenSchema = SqlSchema.findOne({
      Request: AccessToken,
      Result: User,
      execute: (key) => sql`select * from users where accessToken = ${key}`,
    });

    const findByAccessToken = (apiKey: AccessToken) =>
      findByAccessTokenSchema(apiKey).pipe(
        Effect.orDie,
        Effect.withSpan("UsersRepo.findByAccessToken"),
      );

    return {
      ...repo,
      findByAccessToken,
    } as const;
  }),
);

export class UsersRepo extends Context.Tag(
  ContextTags.users.pipe(Effect.runSync),
)<UsersRepo, MakeService<typeof makeUsersRepo>>() {}

export const usersRepoLive = Layer.succeed(
  UsersRepo,
  UsersRepo.of(
    makeUsersRepo.pipe(Effect.provide(sqlLive)).pipe(Effect.runSync),
  ),
);
