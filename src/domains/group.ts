import { Model } from "@effect/sql";
import { AccountId, GroupId } from "./branded";
import { Schema } from "@effect/schema";
import { HttpApiSchema } from "@effect/platform";

export class Group extends Model.Class<Group>("Group")({
  id: Model.Generated(GroupId),
  ownerId: Model.GeneratedByApp(AccountId),
  name: Schema.NonEmptyTrimmedString,
  createdAt: Model.DateTimeInsert,
  updatedAt: Model.DateTimeUpdate,
}) {}

// GroupNotFound is a tagged error that is used when a group is not found
export class GroupNotFound extends Schema.TaggedError<GroupNotFound>()(
  "GroupNotFound",
  {
    id: GroupId,
  },
  HttpApiSchema.annotations({
    status: 404,
  }),
) {}
