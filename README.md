# KisanMitra AI (किसान मित्र AI)
### Smart Agriculture Crop Advisory Assistant for Indian Farmers

KisanMitra AI is a production-ready, region-aware, season-aware crop advisory system built for smallholder and mid-size farmers across India. It supports English, Hindi (हिन्दी), and Marathi (मराठी) and covers the full crop lifecycle with 6 structured advisory modules.

---

## 🚀 Local Hosting & Running

The application is hosted locally and can be accessed at:

- **Frontend Web App (Client):** [http://localhost:5173](http://localhost:5173)
- **Backend API (Server):** [http://localhost:5000](http://localhost:5000)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Static Meta Options:** [http://localhost:5000/api/meta/options](http://localhost:5000/api/meta/options)

### Start Development Server
From the root directory:
```bash
npm run dev
```
This runs both the backend (Express on port 5000) and frontend (Vite on port 5173) concurrently.

### Run Tests
```bash
npm test
```
Runs the Vitest suite covering safety post-processors, AI output schema validation, and request validation.

### Verify Secrets & Bundle Security
```bash
npm run check:secrets
```
Verifies that client production bundles do not leak `GEMINI_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY`.

---

## 🌾 The Six Advisory Modules

1. **Crop Recommendation:** Suggests the best 3 crops for the plot based on season, soil type, water availability, and budget.
2. **Fertilizer & Nutrient Plan:** Stage-wise organic and chemical nutrient schedule with dosage cautions.
3. **Irrigation Schedule:** Weather-adjusted watering frequency and water-saving methods.
4. **Pest & Disease Diagnosis:** Multimodal leaf and symptom diagnosis with optional image uploads (JPEG/PNG/WebP).
5. **Seasonal Crop Calendar:** Month-by-month agricultural operations from land preparation to harvest.
6. **Harvest & Post-Harvest Guidance:** Safe harvesting indices, drying, storage loss prevention, and marketing tips.

---

## 🛠️ Environment Configuration

### Server (`server/.env`)
```env
NODE_ENV=development
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
LOG_LEVEL=info

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
AI_TEMPERATURE=0.3
AI_MAX_OUTPUT_TOKENS=4096
AI_TIMEOUT_MS=45000

# Limits
DAILY_AI_REQUEST_LIMIT=30
MAX_IMAGES_PER_REQUEST=3
MAX_IMAGE_MB=4
```

### Client (`client/.env`)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://localhost:5000/api
```

> **Note on Local Sandbox Mode:** If Supabase or Gemini keys are set to placeholders, the client operates in local development sandbox mode with instant demo exploration enabled.

---

## 🗄️ Database Setup (Supabase)

To connect a live Supabase project:
1. Create a project at [supabase.com](https://supabase.com).
2. Go to the SQL Editor and execute in order:
   - [`supabase/001_schema.sql`](supabase/001_schema.sql)
   - [`supabase/002_rls.sql`](supabase/002_rls.sql)
3. Create a private Storage bucket named `crop-images`.
4. Copy your project URL, anon key, and service role key into `server/.env` and `client/.env`.
