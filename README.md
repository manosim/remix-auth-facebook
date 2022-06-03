# Remix Auth - Facebook Strategy

> A Remix Auth strategy for authenticating with Facebook.

## Development

Once you clone the repository, you can install the dependencies and then start the watcher:

```bash
yarn install
yarn watch
```

Then you can create a _symlink_ using [npm link](https://docs.npmjs.com/cli/v8/commands/npm-link). In the same directory (current repository) run:

```bash
npm link
```

Finally, if you would like to test this strategy locally in a remix project, cd into that directory and run:

```bash
npm link remix-auth-facebook
```

Ps. Note that you although the watcher will compile TS on every change, temporarily you will have to manually restart your remix project's watcher (ie. `npm run dev`).

## How to use it

4. In `tests/index.test.ts` change the tests to use your strategy and test it. Inside the tests you have access to `jest-fetch-mock` to mock any fetch you may need to do.
5. Once you are ready, set the secrets on Github
   - `NPM_TOKEN`: The token for the npm registry
   - `GIT_USER_NAME`: The you want the bump workflow to use in the commit.
   - `GIT_USER_EMAIL`: The email you want the bump workflow to use in the commit.

## Scripts

- `build`: Build the project for production using the TypeScript compiler (strips the types).
- `watch`: Similar to build, but watches for changes and rebuilds on the fly.
- `typecheck`: Check the project for type errors, this also happens in build but it's useful to do in development.
- `lint`: Runs ESLint againt the source codebase to ensure it pass the linting rules.
- `test`: Runs all the test using Jest.

## Documentations

To facilitate creating a documentation for your strategy, you can use the following Markdown

```markdown
# Strategy Name

<!-- Description -->

## Supported runtimes

| Runtime    | Has Support |
| ---------- | ----------- |
| Node.js    | ✅          |
| Cloudflare | ✅          |

<!-- If it doesn't support one runtime, explain here why -->

## How to use

<!-- Explain how to use the strategy, here you should tell what options it expects from the developer when instantiating the strategy -->
```
