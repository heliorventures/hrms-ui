/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Opt-in organization workspace. Business authorization remains server enforced. */
  readonly VITE_ORGANIZATION_ENABLED?: string;
  /** Set `"true"` with `import.meta.env.DEV` to show insecure profile role switcher. */
  readonly VITE_ENABLE_DEV_ROLE_SWITCH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
