export const buildRoute = (base: string, route: string, path = (base + route)
  .replace(/\/+(\/|$)/g, '$1')                       // strip double & trailing slash
): [RegExp, string] =>
  [
    RegExp(`^${path
      .replace(/(\/?\.?):(\w+)\+/g, '($1(?<$2>*))')       // greedy params
      .replace(/(\/?\.?):(\w+)/g, '($1(?<$2>[^$1/]+?))')  // named params and image format
      .replace(/\./g, '\\.')                              // dot in path
      .replace(/(\/?)\*/g, '($1.*)?')                     // wildcard
    }/*$`),
    path,                                                // embed clean route path
  ]
