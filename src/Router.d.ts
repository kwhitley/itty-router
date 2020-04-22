interface RouteHandler<TRequest> {
  (request: TRequest & Request): any;
}

interface Route {
  <TRequest>(path: string, handler: RouteHandler<TRequest & Request>): Router;
}

interface Request {
  path?: string;
  method: string;
  url: string;
  query: {
    [key: string]: string;
  };
  params: {
    [key: string]: string;
  };
}

interface Router {
  handle: (request: Request) => any;
  get: Route;
  put: Route;
  post: Route;
  patch: Route;
  delete: Route;
}

export function Router(): Router;
