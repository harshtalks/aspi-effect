import { SqlClient } from "@effect/sql/SqlClient";
import { Context, Effect } from "effect";
import { AccountsRepo } from "../repositories/accounts.repo";
import { UsersRepo } from "../repositories/users.repo";
import { Uuid } from "../requirements/uuid";
import { User, UserWithSensitiveInfo } from "../domains/user";
import { Account } from "../domains/account";
import { accessTokenFromStr } from "../domains/redacted";
import { policyRequire } from "../domains/policy";

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
  }),
);

export class Accounts extends Context.Tag("@impl/accounts")<Accounts, {}>() {}
