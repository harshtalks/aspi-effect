import { Model } from "@effect/sql";
import { GroupId, PersonId } from "./branded";
import { Schema } from "@effect/schema";

export class Person extends Model.Class<Person>("Person")({
  id: Model.Generated(PersonId),
  groupId: Model.GeneratedByApp(GroupId),
  firstName: Schema.NonEmptyTrimmedString,
  lastName: Schema.NonEmptyTrimmedString,
  dateOfBirth: Model.FieldOption(Model.Date),
  createdAt: Model.DateTimeInsert,
  updatedAt: Model.DateTimeUpdate,
}) {}
