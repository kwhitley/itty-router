import { Router, IttyMethodHandler } from "../src/itty-router";

const rtr = Router();

// Basic methods passed through
rtr.get("/", (req) => {
  const method: "GET" = req.method;
  // @ts-expect-error
  const methodInvalid: "GETT" = req.method;
});
rtr.put("/", (req) => {
  const method: "PUT" = req.method;
  // @ts-expect-error
  const methodInvalid: "PUTT" = req.method;
});
rtr.post("/", (req) => {
  const method: "POST" = req.method;
  // @ts-expect-error
  const methodInvalid: "POSTT" = req.method;
});
rtr.delete("/", (req) => {
  const method: "DELETE" = req.method;
  // @ts-expect-error
  const methodInvalid: "DELETEE" = req.method;
});
rtr.options("/", (req) => {
  const method: "OPTIONS" = req.method;
  // @ts-expect-error
  const methodInvalid: "OPTIONSS" = req.method;
});
rtr.head("/", (req) => {
  const method: "HEAD" = req.method;
  // @ts-expect-error
  const methodInvalid: "HEADD" = req.method;
});
rtr.all("/", (req) => {
  const method: string = req.method; // all doesn't know
});

// Checks for definitely incorrect return type, while still allowing pasthrough
// @ts-expect-error
rtr.get("/path", (req) => {
  return 1;
});

// Route matching:

// Matches basic params
rtr.get("/some/:route/:id", (req) => {
  const a: string = req.params.id;
  const b: string = req.params.route;
  const c: Record<string, string> = req.query;
});

rtr.get("/some/:route/:id?", (req) => {
  const a: string | undefined = req.params.id;
  // @ts-expect-error
  const aIsOptional: string = req.params.id;
});

interface Env {
  SOME_BINDING: DurableObjectNamespace;
}

const rtrWithEnv = Router<[Env]>();

rtrWithEnv.get("/with-env", (req, env) => {
  const ns: DurableObjectNamespace = env.SOME_BINDING;
  // @ts-expect-error
  const missingNs: DurableObjectNamespace = env.SOME_UNKNOWN_BINDING;
});

const rtrWithCtx = Router<[Env, ExecutionContext]>();

rtrWithCtx.get("/with-env", (req, env, ctx) => {
  ctx.passThroughOnException();
  // @ts-expect-error
  ctx.nonExistentMethod();
});

const rtrWithExtensions = Router<
  [Env, ExecutionContext],
  { puppy: IttyMethodHandler<"PUPPY", [Env, ExecutionContext]> }
>();

rtrWithExtensions.puppy("/:puppy", (req) => {
  const puppy: "PUPPY" = req.method;
});
