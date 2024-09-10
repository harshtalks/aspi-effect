import { Model } from "@effect/sql";
import { AccountId } from "./branded";

export class Account extends Model.Class<Account>("Account")({
  id: Model.Generated(AccountId),
  createdAt: Model.DateTimeInsert,
  updatedAt: Model.DateTimeUpdate,
}) {}
