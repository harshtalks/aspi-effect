import { SqlClient } from "@effect/sql/SqlClient";
import { Context, Effect, Layer, Option } from "effect";
import { AccountsRepo, accountsRepoLive } from "../repositories/accounts.repo";
import { UsersRepo, usersRepoLive } from "../repositories/users.repo";
import { Uuid, UuidLive } from "../requirements/uuid";
import {
  CurrentUser,
  User,
  UserId,
  UserNotFound,
  UserWithSensitiveInfo,
} from "../domains/user";
import { Account } from "../domains/account";
import {
  AccessToken,
  accessTokenFromRedacted,
  accessTokenFromStr,
} from "../domains/redacted";
import { policyRequire, Unauthorized } from "../domains/policy";
import { HttpApiBuilder, HttpApiSecurity } from "@effect/platform";
import { security } from "../annonations/security";
import { MakeService } from "../utilities/with-effect";
import { sqlLive } from "../requirements/sql";

const makeAccountsImpl = Effect.all([
  SqlClient,
  AccountsRepo,
  UsersRepo,
  Uuid,
]).pipe(
  Effect.andThen(([sql, accountsRepo, usersRepo, uuid]) => {
    const createUser = (user: typeof User.jsonCreate.Type) =>
      accountsRepo.insert(Account.insert.make({})).pipe(
        Effect.tap((account) => Effect.annotateCurrentSpan("accunt", account)),
        Effect.bindTo("account"),
        Effect.bind("accessToken", () =>
          uuid.generate.pipe(Effect.map(accessTokenFromStr)),
        ),
        Effect.bind("user", ({ accessToken, account }) =>
          usersRepo.insert(
            User.insert.make({
              ...user,
              accountId: account.id,
              accessToken: accessToken,
            }),
          ),
        ),
        Effect.map(
          ({ account, user }) =>
            new UserWithSensitiveInfo({
              ...user,
              account,
            }),
        ),
        sql.withTransaction,
        Effect.orDie,
        Effect.withSpan("Accounts.createUser", {
          attributes: {
            user,
          },
        }),
        policyRequire("User", "create"),
      );

    const updateUser = (
      id: UserId,
      user: Partial<typeof User.jsonUpdate.Type>,
    ) =>
      usersRepo.findById(id).pipe(
        Effect.andThen(
          Option.match({
            onNone: () =>
              new UserNotFound({
                id,
              }),
            onSome: Effect.succeed,
          }),
        ),
        Effect.andThen((prev) =>
          usersRepo.update({
            ...prev,
            ...user,
            id,
            updatedAt: undefined,
          }),
        ),
        sql.withTransaction,
        Effect.catchTag("SqlError", (err) => Effect.die(err)),
        Effect.withSpan("Accounts.updateUser", {
          attributes: {
            id,
            user,
          },
        }),
        policyRequire("User", "ipdate"),
      );

    const findUserByAccessToken = (apiKey: AccessToken) =>
      usersRepo
        .findByAccessToken(apiKey)
        .pipe(
          Effect.withSpan("Accounts.findUserByAccessToken"),
          policyRequire("User", "read"),
        );

    const findUserById = (id: UserId) =>
      usersRepo.findById(id).pipe(
        Effect.withSpan("Accounts.findByUserId", {
          attributes: {
            id,
          },
        }),
        policyRequire("User", "read"),
      );

    const embellishUser = (user: User) =>
      accountsRepo.findById(user.accountId).pipe(
        Effect.flatten,
        Effect.map(
          (account) =>
            new UserWithSensitiveInfo({
              ...user,
              account,
            }),
        ),
        Effect.orDie,
        Effect.withSpan("Accounts.embellishUser", {
          attributes: {
            id: user.id,
          },
        }),
      );

    const httpSecurity = HttpApiBuilder.middlewareSecurity(
      security,
      CurrentUser,
      (token) =>
        usersRepo.findByAccessToken(accessTokenFromRedacted(token)).pipe(
          Effect.andThen(
            Option.match({
              onNone: () =>
                new Unauthorized({
                  actorId: UserId.make(-1),
                  entity: "User",
                  action: "read",
                }),
              onSome: Effect.succeed,
            }),
          ),
          Effect.withSpan("Accounts.httpSecurity"),
        ),
    );

    return {
      createUser,
      updateUser,
      findUserById,
      findUserByAccessToken,
      embellishUser,
      httpSecurity,
    } as const;
  }),
);

export class Accounts extends Context.Tag("@impl/accounts")<
  Accounts,
  MakeService<typeof makeAccountsImpl>
>() {}

export const accountsLive = Layer.succeed(
  Accounts,
  Accounts.of(
    makeAccountsImpl
      .pipe(
        Effect.provide(sqlLive),
        Effect.provide(accountsRepoLive),
        Effect.provide(usersRepoLive),
        Effect.provide(UuidLive),
      )
      .pipe(Effect.runSync),
  ),
);
