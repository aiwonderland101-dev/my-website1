# Storage service

## Environment variables

The storage provider supports the following environment variables (all optional):

- `STORAGE_PROVIDER`: Provider key selected by the factory in `provider.ts`. Currently only `supabase` is supported. Defaults to `supabase`.
- `SUPABASE_STORAGE_BUCKET`: Supabase bucket name. Defaults to `projects`.
- `SUPABASE_STORAGE_UPSERT`: Controls upload overwrite behavior (`true`/`false`). Defaults to `true`.
- `SUPABASE_STORAGE_LIST_LIMIT`: Max number of objects returned from `list`. Defaults to `1000`.

## Behavior

- `provider.ts` exposes `createStorageProvider(context)` as the factory boundary for future provider/tenant routing.
- `storageProvider` is the default singleton returned by `createStorageProvider()`.
- `SupabaseProvider.ts` reads env config with safe defaults and implements the shared `StorageProvider` contract.
