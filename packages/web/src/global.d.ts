/// <reference types="@solidjs/start/env" />

interface ImportMetaEnv {
  readonly FACEBOOK_APP_ID: string;
  readonly FACEBOOK_APP_SECRET: string;
  readonly DB: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
// declare module '@solidjs/start/server' {
//   interface RequestEventLocals {
//     locale: Intl.Locale;
//   }
// }
