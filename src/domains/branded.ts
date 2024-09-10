// All the branded types here

import { Schema } from "@effect/schema";

// AccountId identifier with branded type
export const AccountId = Schema.Number.pipe(Schema.brand("AccountId"));
export type AccountId = typeof AccountId.Type;
export const brandedAccountId = Schema.NumberFromString.pipe(
  Schema.compose(AccountId),
);

// UserId identifier with branded type
export const UserId = Schema.Number.pipe(Schema.brand("UserId"));
export type UserId = typeof UserId.Type;
export const brandedUserId = Schema.NumberFromString.pipe(
  Schema.compose(UserId),
);

// access token related types
export const AccessTokenNonRedacted = Schema.String.pipe(
  Schema.brand("AccessToken"),
);

// group id related types
export const GroupId = Schema.Number.pipe(Schema.brand("GroupId"));
export type GroupId = typeof GroupId.Type;
export const brandedGroupId = Schema.NumberFromString.pipe(
  Schema.compose(GroupId),
);

// Person id related types
export const PersonId = Schema.Number.pipe(Schema.brand("PersonId"));
export type PersonId = typeof PersonId.Type;
export const brandedPersonId = Schema.NumberFromString.pipe(
  Schema.compose(PersonId),
);
