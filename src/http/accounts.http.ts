// accounts http

import { Effect, Layer, Option } from "effect";
import { HttpApiBuilder } from "@effect/platform";
import Api from "../api";
import { Accounts, accountsLive } from "../implementions/account.impl";
import { AccountsPolicy, accountsPolicyLive } from "../policies/accouns.policy";
import { CurrentUser, UserNotFound } from "../domains/user";
import { policyUse, withSystemActor } from "../domains/policy";
import { security } from "../annonations/security";

export const httpAccountsLive = HttpApiBuilder.group(
  Api,
  "accounts",
  (handlers) =>
    Effect.all([Accounts, AccountsPolicy]).pipe(
      Effect.andThen(([accounts, policy]) => {
        return handlers.pipe(
          // get user
          HttpApiBuilder.handle("getUser", ({ path }) => {
            return accounts.findUserById(path.id).pipe(
              Effect.andThen(
                Option.match({
                  onNone: () => new UserNotFound({ id: path.id }),
                  onSome: Effect.succeed,
                }),
              ),
              policyUse(policy.canRead(path.id)),
            );
          }),
          // get myself
          HttpApiBuilder.handle("me", () => {
            return CurrentUser.pipe(
              Effect.andThen(accounts.embellishUser),
              withSystemActor,
            );
          }),
          // update user
          HttpApiBuilder.handle("updateUser", ({ path, payload }) => {
            return accounts
              .updateUser(path.id, payload)
              .pipe(policyUse(policy.canUpdate(path.id)));
          }),
          accounts.httpSecurity,
          // create user
          HttpApiBuilder.handle("createUser", ({ payload }) => {
            return accounts.createUser(payload).pipe(
              withSystemActor,
              Effect.tap((user) =>
                HttpApiBuilder.securitySetCookie(security, user.accessToken),
              ),
            );
          }),
        );
      }),
    ),
).pipe(Layer.provide(accountsLive), Layer.provide(accountsPolicyLive));
