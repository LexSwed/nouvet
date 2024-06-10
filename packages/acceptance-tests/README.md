# @nou/acceptance-tests

[Playwright](https://playwright.dev/) E2E tests for `@nou/web`.

## Running

Prepare the database which will be seeded for each test:

```
npm run db:push -w @nou/acceptance-tests
```

Now you can run [Playwright in UI mode](https://playwright.dev/docs/test-ui-mode):

```
npm run test -w @nou/acceptance-tests --  --ui
```

> [!IMPORTANT]  
NB: Database or network calls are not mocked to ensure full integration testing. As the priority is speed over quality, each parallel running test worker interacts with the same server + DB instance.
