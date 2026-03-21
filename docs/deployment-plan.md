# The 3-2-1 Deployment Analysis & Action Plan

**Author**: Gemini
**Topic**: GitHub Submodule Traps & Vercel Monorepo Serverless Integration
**Timestamp**: 2026-03-22T02:15:00+05:30

---

## 3 Core Problems Identified

1.  **The "Empty Folder" GitHub Bug**: When you use a React scaffold (like Create React App or Vite), it automatically initializes a hidden `.git` folder inside the `frontend` directory. When you push the parent `pooja_hooda_technical_assessment` folder, Git sees the nested `.git` and assumes `frontend` is an external "submodule" rather than part of your code. GitHub displays this as an empty, unclickable folder.
2.  **The Vercel Root Collision**: Standard Vercel deployment expects a `package.json` at the root. In our monorepo, it's inside `/frontend`. Without configuration, Vercel doesn't know where to build the application.
3.  **FastAPI on Vercel**: Vercel is a Node.js platform, but it *can* run Python via Serverless Functions. However, it expects Python files to live in an `api/` folder, while our code lives in `backend/`.

---

## 2 Deep Research Solutions

### Research 1: The Git Index Purge
To force Git to track the actual React files instead of the submodule pointer, we must cleanly sever the nested Git history without deleting your actual files.
**The Fix**:
1. Delete `frontend/.git`.
2. Remove the cached submodule reference from Git's index.
3. Re-stage the actual files. 
*(Commands provided in the Execution Step below).*

### Research 2: Vercel Serverless Python Routing
To deploy both React and FastAPI to a single Vercel project, we do not need to rewrite the codebase. We use a `vercel.json` file at the root.
- **Frontend Override**: We tell Vercel the `Root Directory` is `frontend`.
- **Backend Override**: We use the `vercel.json` rewrites array to intercept all `/pipelines/parse` network calls and route them to `../backend/main.py`. Vercel automatically detects the FastAPI `app` instance and runs it in a Python Serverless environment.
*(Limits: Free tier Vercel functions timeout after 10s, which is perfectly fine for Kahn's algorithm).*

---

## 1 Definitive Execution Plan

### Step 1: Fix GitHub IMMEDIATELY (Run these in your terminal)
Open your terminal in the root `pooja_hooda_technical_assessment` folder and run exactly these lines:

```bash
# 1. Force delete the hidden nested git folder
Remove-Item -Recurse -Force frontend\.git

# 2. Tell git to stop tracking frontend as a submodule
git rm --cached frontend

# 3. Re-add the frontend folder as actual files
git add frontend

# 4. Commit the fix
git commit -m "Fix: Converted frontend from submodule to tracked directory"

# 5. Push to GitHub
git push
```
*After running this, refresh your GitHub repo. The `frontend` folder will no longer be empty.*

### Step 2: Configure Vercel (The Single Deployment Link)

To make Vercel build both frontend and backend seamlessly, we need two files at the root of the project.

**A. Create `vercel.json` at the root (`pooja_hooda_technical_assessment/vercel.json`):**
```json
{
  "builds": [
    {
      "src": "backend/main.py",
      "use": "@vercel/python"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    }
  ],
  "rewrites": [
    {
      "source": "/pipelines/parse",
      "destination": "/backend/main.py"
    },
    {
      "source": "/(.*)",
      "destination": "/frontend/$1"
    }
  ]
}
```

**B. Update `backend/main.py` for Vercel:**
Vercel needs a variable named `app` exposed. FastAPI already does this (`app = FastAPI()`), so no changes are strictly needed there. However, you must ensure `requirements.txt` is inside the `backend` folder so Vercel knows what to install, and create a `backend/vercel.json` or root `requirements.txt` proxy. (Actually, for `@vercel/python`, it looks for `requirements.txt` in the same directory as the target `src` script).

### Step 3: Deployment
1. Log into your Vercel Dashboard.
2. Click **Add New Project** and import from your newly fixed GitHub repository.
3. **CRITICAL VERIFICATION**: Leave the "Root Directory" as the default (the parent checkout folder). Vercel will process the `vercel.json` we created to handle building the frontend and routing the backend automatically.

If you give me the green light, I can run the Git commands right now to fix your GitHub repository instantly!
