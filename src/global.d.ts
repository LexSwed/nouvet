/// <reference types="@solidjs/start/env" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly FACEBOOK_APP_ID: string;
  readonly FACEBOOK_APP_SECRET: string;
  readonly DB: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
