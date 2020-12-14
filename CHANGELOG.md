## Changelog
Until this library makes it to a production release of v1.x, **minor versions may contain breaking changes to the API**.  After v1.x, semantic versioning will be honored, and breaking changes will only occur under the umbrella of a major version bump.

- **v1.4.0** - adds support for optional format params (e.g. "/:id.:format?" --> { params: { id: '13', format: 'jpg' }})
- **v1.3.0** - adds support for multiple args to handle(request, ...args) method (@hunterloftis)
- **v1.2.2** - fix: require verify/build pass before publishing and fixed README badges (should point to v1.x branch)
- **v1.2.0** - feature: chainable route declarations (with test)... that didn't take long...
- **v1.1.1** - updated README to reflect that chaining actually never was working... (not a breaking change, as no code could have been using it)
- **v1.1.0** - feature: added single option `{ base: '/some/path' }` to `Router` for route prefixing, fix: trailing wildcard issue (e.g. `/foo/*` should match `/foo`)
- **v1.0.0** - production release, stamped into gold from x0.9.7
- **v0.9.0** - added support for multiple handlers (middleware)
- **v0.8.0** - deep minification pass and build steps for final module
- **v0.7.0** - removed { path } from  request handler context, travis build fixed, added coveralls, improved README docs
- **v0.6.0** - added types to project for vscode intellisense (thanks [@mvasigh](https://github.com/mvasigh))
- **v0.5.4** - fix: wildcard routes properly supported