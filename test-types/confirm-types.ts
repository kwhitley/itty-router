import { Router, IttyMethodHandler } from "../src/itty-router";
import type { Router as RtrType } from "../src/itty-router";

// The global Request interface is extended and reflected in the handler below
declare global {
  interface Request {
    cat?: "cat";
  }
}

const router = Router({
  routes: [
    [
      "FOO",
      /\d/,
      [
        (request) => {
          const str: string = request.method;
          const cat: "cat" | undefined = request.cat;
        },
      ],
    ],
  ],
});

const rtr = Router();

rtr.get("*", (req) => {
  // supports wildcard match
});
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
  methodExtension: {
    puppy: IttyMethodHandler<"PUPPY">;
  };
}>();

rtrWithExtensions.puppy("/:puppy", (req) => {
  const puppy: "PUPPY" = req.method;
});

// Enforces the return type to be a Response / Promise<Response>

const rtrWithStrictReturn = Router<{
  handlerReturn: Response;
}>();

rtrWithStrictReturn.get("/good", () => {
  return new Response();
});

rtrWithStrictReturn.get("/good-promise", async () => {
  return new Response();
});

// @ts-expect-error
rtrWithStrictReturn.get("/bad", async () => {
  return 1;
});

// @ts-expect-error
rtrWithStrictReturn.get("/bad-void", () => {
  //
});

rtrWithStrictReturn.handle({ url: "/good", method: "GET" }).then((res) => {
  const bool: boolean = res.ok;
  // @ts-expect-error
  const invalid: boolean = res.okk;
});

// Ensure Router can be used as a type:

function routerAsType(rtr: RtrType) {
  return rtr.get("/method", () => {});
}

routerAsType(rtr);
