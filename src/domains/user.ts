import { HttpApiSchema } from "@effect/platform";
import { Schema } from "@effect/schema";
import { Model } from "@effect/sql";
import { AccountId } from "./branded";
import { Email } from "./email";
import { AccessToken } from "./redacted";
import { Account } from "./account";
import { Context } from "effect";

// UserId identifier with branded type
export const UserId = Schema.Number.pipe(Schema.brand("userId"));

// UserId type
export type UserId = typeof UserId.Type;

// UserId model from user id
export const brandedUserId = Schema.NumberFromString.pipe(
  Schema.compose(UserId),
);

export class User extends Model.Class<User>("User")({
  id: Model.Generated(UserId),
  accountId: Model.GeneratedByApp(AccountId),
  email: Email,
  accessToken: Model.Sensitive(AccessToken),
  createdAt: Model.DateTimeInsert,
  updatedAt: Model.DateTimeUpdate,
}) {}

// It exposes sentitive information
export class UserWithSensitiveInfo extends Model.Class<UserWithSensitiveInfo>(
  "UserWithSensitiveInfo",
)({
  ...Model.fields(User),
  accessToken: AccessToken,
  account: Account,
}) {}

// Errors
export class UserNotFound extends Schema.TaggedError<UserNotFound>()(
  "UserNotFound",
  {
    id: UserId,
  },
  HttpApiSchema.annotations({
    status: 404,
  }),
) {}

// service -> dep injection
// Dep Declaration
export class CurrentUser extends Context.Tag("Domain/User/CurrentUser")<
  CurrentUser,
  User
>() {}
