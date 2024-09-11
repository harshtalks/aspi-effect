// making accounts repository -  as a layer

import { Model } from "@effect/sql";
import { Context, Effect, Layer } from "effect";
import { Account } from "../domains/account";
import { ContextTags } from "./tags";
import { MakeService } from "../utilities/with-effect";
import { sqlLive } from "../requirements/sql";

export const makeAccountRepoService = Model.makeRepository(Account, {
  tableName: "accounts",
  idColumn: "id",
  spanPrefix: "AccountsRepository",
});

export class AccountsRepo extends Context.Tag(
  ContextTags.accounts.pipe(Effect.runSync),
)<AccountsRepo, MakeService<typeof makeAccountRepoService>>() {}

export const accountsRepoLive = Layer.succeed(
  AccountsRepo,
  AccountsRepo.of(
    makeAccountRepoService.pipe(Effect.provide(sqlLive)).pipe(Effect.runSync),
  ),
);
