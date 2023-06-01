# Contributing to Itty

The [Open Source Guides](https://opensource.guide/) website has a collection of resources for individuals, communities, and companies. These resources help people who want to learn how to run and contribute to open source projects. Contributors and people new to open source alike will find the following guides especially useful:

- [How to Contribute to Open Source](https://opensource.guide/how-to-contribute/)
- [Building Welcoming Communities](https://opensource.guide/building-community/)

## Bugs

We use [GitHub issues](https://github.com/kwhitley/itty-router/issues) for our public bugs. If you would like to report a problem, take a look around and see if someone already opened an issue about it. If you are certain this is a new unreported bug, you can submit a [bug report](#reporting-new-issues).

If you have questions about using itty, [contact us on Discord](https://discord.com/channels/832353585802903572), and we will do our best to answer your questions.

### Reporting new issues

When [opening a new issue](https://github.com/kwhitley/itty-router/issues/new/choose), always make sure to fill out the issue template. **This step is very important!** Not doing so may result in your issue not being managed in a timely fashion. Don't take this personally if this happens, and feel free to open a new issue once you've gathered all the information required by the template.

- **One issue, one bug:** Please report a single bug per issue.
- **Provide reproduction steps:** List all the steps necessary to reproduce the issue. The person reading your bug report should be able to follow these steps to reproduce your issue with minimal effort.

### Proposing a change

If you would like to request a new feature or enhancement but are not yet thinking about opening a pull request, you can also file an issue with [feature template](https://github.com/kwhitley/itty-router/issues/new?template=feature_request.yml).

If you're only fixing a bug, it's fine to submit a pull request right away, but we still recommend that you file an issue detailing what you're fixing. This is helpful in case we don't accept that specific fix but want to keep track of the issue.

Small pull requests are much easier to review and more likely to get merged.

### Installation

1. Ensure you have [npm](https://www.npmjs.com/get-npm) installed.
1. Ensure you have [yarn](https://classic.yarnpkg.com/lang/en/docs/install) installed.
1. After cloning the repository, run `yarn` in the root of the repository.
1. To start development, run `yarn dev`.

### Creating a branch

Fork [the repository](https://github.com/kwhitley/itty-router) and create your branch from `v4.x`. If you've never sent a GitHub pull request before, you can learn how from [this free video series](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github).

### Testing

A good test plan has the exact commands you ran and their output, provides screenshots or videos if the pull request changes UI.

- If you've changed APIs, update the documentation, including at the appropriate places within [itty.dev](https://itty.dev/itty-router).

#### Writing tests

All tests are located in adjacent `.spec.ts` files, next to the file being tested.

#### Running tests

1. To run test, run `yarn test`, or `yarn dev` for continuous testing (includes `--watch`).

### Style guide

[Eslint](https://eslint.org) will catch most styling issues that may exist in your code. You can check the status of your code styling by simply running `yarn lint`.

#### Code conventions

- `camelCase` for public variable names and methods.
- No abbreviated variable names - maximize readability and let the minification process do its thing later.

### Sending your pull request

Please make sure the following is done when submitting a pull request:

1. Describe your **test plan** in your pull request description. Make sure to test your changes.
1. Make sure your code lints (`yarn lint`).
1. Make sure your tests pass (`yarn test`).

All pull requests should be opened against the `v4.x` branch. Make sure the PR does only one thing, otherwise please split it.

#### Breaking changes

When adding a new breaking change, follow this template in your pull request:

```md
### New breaking change here

- **Who does this affect**:
- **How to migrate**:
- **Why make this breaking change**:
- **Severity (number of people affected x effort)**:
```

## License

By contributing to itty, you agree that your contributions will be licensed under its [MIT license](https://github.com/kwhitley/itty-router/blob/master/LICENSE).

## Questions

Feel free to ask in [#itty-router](https://discord.com/channels/832353585802903572) on [Discord](https://discord.com/channels/832353585802903572) if you have questions about our process, how to proceed, etc.
