# Receiptly

Receiptly captures receipt images, extracts expense data with Veryfi, and stores the results in Supabase.

## Project

## Development

```sh
npm install
npm run dev
```

Run the local checks with:

```sh
npm test
npm run lint
npm run build
```

The GitHub Actions workflow in `.github/workflows/deploy.yml` runs on every push. It runs the
unit tests, lint, and production build first. Successful checks are deployed as a Vercel preview,
then `npm run test:deployed` verifies the deployed homepage and receipts API. A failed test fails
the workflow and is shown in the workflow summary with the failing check's error output.

To enable the workflow, add these GitHub Actions repository secrets:

- `VERCEL_TOKEN`: a Vercel access token
- `VERCEL_ORG_ID`: the Vercel team or account ID
- `VERCEL_PROJECT_ID`: the Vercel project ID

Configure the required Supabase and Veryfi environment variables in the Vercel project settings.
After pushing a commit, open the repository's Actions tab, select **Test and deploy**, and inspect
the run summary for the deployment URL and deployed test status.

Required environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
`VERYFI_CLIENT_ID`, `VERYFI_USERNAME`, and `VERYFI_API_KEY`.

## Built with

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
