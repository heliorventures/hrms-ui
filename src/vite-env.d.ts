/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Set `"true"` with `import.meta.env.DEV` to show insecure profile role switcher. */
  readonly VITE_ENABLE_DEV_ROLE_SWITCH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
