import { Schema } from "@effect/schema";
import { CurrentUser, User, UserId } from "./user";
import { HttpApiSchema } from "@effect/platform";
import { Effect } from "effect";
import { Account } from "./account";

// Error
export class Unauthorized extends Schema.TaggedError<Unauthorized>()(
  "Unauthorized",
  {
    // action performed by
    actorId: UserId,
    // action performed on
    entity: Schema.String,
    // action performed is
    action: Schema.String,
  },
  HttpApiSchema.annotations({
    status: 403,
  }),
) {
  get message() {
    return `Unauthorized: Actor - "${this.actorId}" is not allowed to perform the action - "${this.action}" on entity - "${this.entity}"`;
  }
}

export const TypeId: unique symbol = Symbol.for(
  "Domain/Policy/AuthorizedActor",
);
export type typeId = typeof TypeId;

// pretty neat trick
// TS being the sructurally typed, if any object matches the structure of AuthorizedActor, it is considered as AuthorizedActor, we dont want that. thats why we use a symbol as unique identifier which is not accessible outside the module
export interface AuthorizedActor<
  TEntity extends string = any,
  TAction extends string = any,
> extends User {
  readonly [TypeId]: {
    readonly entity: TEntity;
    readonly action: TAction;
  };
}

// why any? -> lets explore this later
// TODO
export const authorizeUser = (user: User): AuthorizedActor => User as any;

// Policy Work
// Here we are consuming the dep CurrentUser, -> could throw error of tag "unAuthorized"
export const policy = <TEntity extends string, TAction extends string, E, R>(
  entity: TEntity,
  action: TAction,
  handler: (actor: User) => Effect.Effect<boolean, E, R>,
): Effect.Effect<
  AuthorizedActor<TEntity, TAction>,
  E | Unauthorized,
  R | CurrentUser
> => {
  return Effect.andThen(CurrentUser, (actor) => {
    return Effect.andThen(handler(actor), (isAuthorized) => {
      return isAuthorized
        ? Effect.succeed(authorizeUser(actor))
        : Effect.fail(
            new Unauthorized({
              action: action,
              entity: entity,
              actorId: actor.id,
            }),
          );
    });
  });
};

// Policy Composition
export const policyCompose = <TActor extends AuthorizedActor, E, R>(
  that: Effect.Effect<TActor, E, R>,
) => {
  return <TActor2 extends AuthorizedActor, E2, R2>(
    self: Effect.Effect<TActor2, E2, R2>,
  ): Effect.Effect<TActor | TActor2, E | Unauthorized, R | CurrentUser> => {
    return Effect.zipRight(self, that) as any;
  };
};

// what is happening here?
// we have a policy -> generated from the "policy function above"
// then we have a effect which we want to run when the policy is satisfied
// we are zipping the policy with the effect, so that the effect is only run when the policy is satisfied.
// we need to reove the TActor as a requirement since the returning effect is not dependent on the TActor
export const policyUse = <TActor extends AuthorizedActor, E, R>(
  policy: Effect.Effect<TActor, E, R>,
) => {
  return <A, E2, R2>(
    effect: Effect.Effect<A, E2, R2>,
  ): Effect.Effect<A, E | E2, Exclude<R2, TActor> | R> => {
    return policy.pipe(Effect.zipRight(effect)) as any;
  };
};

export const policyRequire = <TEntity extends string, TAction extends string>(
  _entity: TEntity,
  _action: TAction,
) => {
  return <A, E, R>(
    effect: Effect.Effect<A, E, R>,
  ): Effect.Effect<A, E, R | AuthorizedActor<TEntity, TAction>> => {
    return effect as any;
  };
};

// what is happening here?
// we have a effect which we want to run when the policy is satisfied
// but here we can make sure that the effect will satisfy the AuthrizedUser Requirement by making it a system actor
export const withSystemActor = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
): Effect.Effect<A, E, Exclude<R, AuthorizedActor>> => {
  return effect as any;
};
