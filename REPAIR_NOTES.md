# RabtaaAI repair notes

- Preserved existing photo, text, chatbot, and UI implementations.
- Voice: added explicit Groq error handling (authentication, quota, size, empty transcription), preventing opaque failures. Recording still requires browser microphone permission and localhost/HTTPS.
- Complaint history: previously read exclusively from a process-local dictionary, so records disappeared on restart. Now `/api/complaints/my` reads from Supabase using the signed-in user ID.
- Complaint creation: previously silently swallowed database insertion failures and returned a false success. Now it reports a 503 if persistence fails, and requires a signed-in user.
- Removed seeded demo complaint records from the active repository. No mock complaints are shown as user data.
- Frontend now displays the complaint API error message.

## Limitations / required verification

- Groq transcription, Supabase connectivity and full browser recording require live credentials and a browser and have not been verified here.
- Existing authentication helper accepts X-User-ID and decodes JWT without verification; **do not expose this backend publicly** until Supabase JWT validation and row-level access are enforced. This is an existing security defect, not fixed in this patch.
- Existing repository uses in-memory cache for several other complaint operations (email status, support, delete); these paths need a further database-backed migration and end-to-end verification.
- The schema and database permissions must allow a user_id matching the Supabase user UUID. A failing insert now returns a visible error instead of claiming success.
- The project is kept in TSX to avoid breaking the working frontend; no wholesale JSX conversion was attempted.

## Manual verification

1. Restore backend/.env locally (never commit it); configure Supabase and Groq.
2. Start backend and frontend using their READMEs.
3. Sign in, record 5–10 seconds, stop, play it back, and analyze. Check FastAPI logs if transcription fails.
4. Create a text complaint, refresh My Complaints, restart FastAPI and verify the complaint still appears.
5. Test existing photo analysis and chatbot for regression.
