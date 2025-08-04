## Changelog

#### v5.0.20
  - docs: export default { ...router } as README example
#### v5.0.17
  - fixed: corsify should clone response before appending headers
#### v5.0.16
  - maintenance: README
#### v5.0.15
  - maintenance: types cleanup and publishing test
#### v5.0.14
  - maintenance: types cleanup and publishing test
#### v5.0.13
  - fixed: Router/AutoRouter stages were not connected to router-level generics
#### v5.0.12
  - fixed: ./types was not being properly exported
#### v5.0.10
  - fixed: response formatters in finally stage could still cross pollute headers in Node
#### v5.0.9
  - fixed: cors preflight should reflect requested headers as the default (required for credentials)
#### v5.0.7
  - fixed: withParams could attempt to bind null (collision with node adapter)
#### v5.0.6
  - fixed: corsify as replacing status codes (now mutates original response)
#### v5.0.5
  - fixed: corsify now properly ignores WebSocket responses
#### v5.0.4
  - fixed: (TypeScript) middleware corrupting downstream request types and args
#### v5.0.2
  - fixed: AutoRouter was missing the router-level generics support of the other 2 routers.
  - fixed: All 3 routers had their 3rd generic argument, ResponseType added per the spec.
#### v5.0.0
  - BREAKING: router.fetch replaces router.handle (now deprecated)
  - BREAKING: "createCors" has been deprecated in favor of "cors" (new options & requirements)
  - changed: previous Router (smallest) is now IttyRouter
  - added: Router (full backwards compatability with previous Router) has been added, including:
    - "before" stage (array of request handlers)
    - "finally" stage (array of response handlers)
    - "catch" stage (single error handler)
  - added: AutoRouter (batteries-included Router)
  - fixed (TS): Routers types have been modified to allow both rotuer-level generics AND route-level generics in the same instance.
  - docs: see Migration guide at https://itty.dev/itty-router/migrations/v4-v5

For changes prior to v5, see the [v4 CHANGELOG](https://github.com/kwhitley/itty-router/edit/v4.x/CHANGELOG.md)
