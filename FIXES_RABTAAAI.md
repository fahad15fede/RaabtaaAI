# RabtaaAI repair notes

## Verified from supplied archive
- Gemini image service previously returned a generic `other` complaint when the provider failed. This could produce fabricated, vague reports. It now rejects missing credentials, invalid provider output and ambiguous images with explicit HTTP errors.
- Photo route now validates JPEG/PNG/WebP magic bytes, size and base64 and retains the correct MIME type.
- Duplicate location formatting in complaint generation was simplified.
- The supplied archive contained no chatbot route or chatbot frontend component despite the README describing one. A minimal Groq-powered civic guidance chat endpoint and floating frontend chat were added. This is **not** a complete LangChain/vector RAG system; the original implementation was absent from the provided source.
- Frontend branding changed to RabtaaAI. Internal database identifiers and complaint reference prefix are preserved for compatibility.

## Limitations and verification
- Python source passed `compileall` syntax verification.
- External Gemini/Groq API requests cannot be verified without credentials/network access.
- Frontend TypeScript build was not verified: supplied node_modules contains Windows binaries, and Linux tsc executable was unavailable.
- Real image classification accuracy and full integration tests remain unverified.
- No `.env`, `.git`, `node_modules`, caches or credentials are included in the delivery archive.

## Start
Backend: `cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload`
Frontend: `cd frontend && npm install && npm run dev`
Configure `GEMINI_API_KEY`, `GROQ_API_KEY`, Supabase keys and `VITE_API_BASE_URL` in local environment files (not included). Do not send real authority emails while testing.
