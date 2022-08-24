import { Router, IttyMethodHandler } from "../src/itty-router";

const rtr = Router();

rtr.get("/", (req) => {
  // @ts-expect-error (ensure these aren't CF types)
  req.cf;
});

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

rtr.get("/some/:route/:id*", (req) => {
  const a: string = req.params.id;
});

const rtrWithExtensions = Router<{
  apiExtensions: {
    puppy: IttyMethodHandler<"PUPPY">;
  };
}>();

rtrWithExtensions.puppy("/:puppy", (req) => {
  const puppy: "PUPPY" = req.method;
});
