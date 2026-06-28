# Vercel Data Collection

1. Create an Upstash Redis database.
2. Import this folder into Vercel.
3. In the Vercel project settings, add:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `RESULTS_ADMIN_KEY`
4. Redeploy the project after adding the variables.

Completed games are submitted automatically to `/api/results`.

To retrieve all records:

```powershell
Invoke-RestMethod `
  -Uri "https://YOUR-PROJECT.vercel.app/api/results" `
  -Headers @{ Authorization = "Bearer YOUR_RESULTS_ADMIN_KEY" }
```

Do not expose the Redis token or admin key in `script.js`, HTML, or a public repository.
