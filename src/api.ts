import { HttpApi, OpenApi } from "@effect/platform";
import { AccountsApi } from "./api/accounts";
import { GroupsApi } from "./api/group";
import { PeopleApi } from "./api/people";
import { HealthApi } from "./api/health";

const Api = HttpApi.empty.pipe(
  HttpApi.addGroup(HealthApi),
  HttpApi.addGroup(AccountsApi),
  HttpApi.addGroup(GroupsApi),
  HttpApi.addGroup(PeopleApi),
  OpenApi.annotate({
    title: "API",
  }),
);

export default Api;
