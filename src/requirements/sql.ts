// sql reqiurement
import { fileURLToPath } from "url";
import { SqliteClient, SqliteMigrator } from "@effect/sql-sqlite-node";
import { Config, Layer } from "effect";
import { NodeContext } from "@effect/platform-node";

const clientLive = SqliteClient.layer({
  filename: Config.succeed("data/db.sqlite"),
});

const migratorLive = SqliteMigrator.layer({
  loader: SqliteMigrator.fromFileSystem(
    fileURLToPath(new URL("./migrations", import.meta.url)),
  ),
}).pipe(Layer.provide(NodeContext.layer));

export const sqlLive = migratorLive.pipe(Layer.provideMerge(clientLive));
