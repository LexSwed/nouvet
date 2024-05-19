<img src="./packages/web/public/icons/icon.svg" width="48" height="48" />

# NouVet

NouVet is an app for pet owners. The project has been created with the goal of building a web application that maximizes the value to the users while remaining as cheap as possible.

The project has a [license](./LICENSE), the main purpose of which is to convey my attitude to copying the project. I don't append a license text to each source file, but I expect the source of the copy to be included, and remain open sourced. This will make me happy.

## Development

### Monorepo

The codebase is split into:

- `@nou/config` for shared configurations.
- `@nou/ui` for component library development.
- `@nou/web` for the actual app.

I split it this way only because I hate all the Storybook dependencies in the main project.

### Running

To run the application locally, start from setting the environment variables.
See `packages/web/.env.example`.

Now you can create the SQLite file and apply the schema:

```
npm run db:migrate -w @nou/web
```

Now your app will be running correctly:

```
npm run dev:web
```

If you wish to work on the component library, start Storybook with:

```
npm run dev:ui
```
