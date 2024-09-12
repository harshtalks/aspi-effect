import { Layer } from "effect";
import { httpLive } from "./src/index";
import { telemetryLive } from "./src/requirements/telemetry";
import { NodeRuntime } from "@effect/platform-node";

httpLive.pipe(Layer.provide(telemetryLive), Layer.launch, NodeRuntime.runMain);
