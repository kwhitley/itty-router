/// <reference types="@cloudflare/workers-types" />
import { Router } from "../../src/itty-router";

interface Env {
  TEST_OBJECT: DurableObjectNamespace;
}

export default {
  fetch(req: Request, env: Env, ctx: ExecutionContext) {
    // If we see a red squiggle here in VSCode, it's because it isn't using the tsconfig.cf.json to check the file,
    // but we are seeing the correct behavior with tsc -p tsconfig.cf.json
    const a: IncomingRequestCfProperties | undefined = req.cf;
    const rtr = Router<{ handlerArgs: [Env, ExecutionContext] }>();
    rtr.get("/a/:paramA/b/:paramB?", (req, env, ctx) => {
      const paramA: string = req.params.paramA;
      // @ts-expect-error
      const nonRequired: string = req.params.paramB;
      const paramB: string | undefined = req.params.paramB;

      const getMethod: "GET" = req.method;
      const envObj: DurableObjectNamespace = env.TEST_OBJECT;
      ctx.passThroughOnException();
    });
    rtr.handle(req, env, ctx);
  },
};

const eventRouter = Router<{ handlerArgs: [FetchEvent] }>();

eventRouter.get("/path", (req, evt) => {
  evt.passThroughOnException();
  // @ts-expect-error
  evt.nonExistentMethod();
});

addEventListener("fetch", (evt: FetchEvent) => {
  eventRouter.handle(evt.request, evt);
  // @ts-expect-error
  eventRouter.handle(evt.request, 1);
  // @ts-expect-error
  eventRouter.handle(evt.request);
});
