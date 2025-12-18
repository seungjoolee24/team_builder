# Deployment Guide for Sogang Team-Building Service

This guide will help you deploy the **Backend** to **Render** and the **Frontend** to **Vercel**.

## Prerequisites
- GitHub Account
- [Render Account](https://render.com)
- [Vercel Account](https://vercel.com)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (You already have this!)

---

## Part 1: Backend Deployment (Render)

1.  **Push your code to GitHub**
    - Ensure your project is in a GitHub repository.

2.  **Create Web Service on Render**
    - Go to [Render Dashboard](https://dashboard.render.com).
    - Click **New +** -> **Web Service**.
    - Connect your GitHub repository.

3.  **Configure Service**
    - **Name**: `sogang-teambuilder-backend` (or similar)
    - **Root Directory**: `server` (Important! This tells Render the backend is in the `server` folder)
    - **Environment**: `Node`
    - **Build Command**: `npm install`
    - **Start Command**: `npm start`

4.  **Environment Variables**
    Add the following variables in the "Environment" tab:
    - **Key**: `MONGODB_URI`
    - **Value**: `mongodb+srv://hrseungjoo_db_user:Leetj0705%23@cluster0.skr55o2.mongodb.net/sogang-teambuilder?retryWrites=true&w=majority&appName=Cluster0`
    
    - **Key**: `PORT`
    - **Value**: `10000`

5.  **Deploy**
    - Click **Create Web Service**.
    - Wait for the build to finish.
    - **Copy your Backend URL** (e.g., `https://sogang-teambuilder-backend.onrender.com`).

---

## Part 2: Frontend Deployment (Vercel)

1.  **Prepare `vercel.json`**
    - In your local project, open `vercel.json`.
    - Replace `https://YOUR_BACKEND_URL.com/api/:path*` with your **actual Backend URL** from Part 1.
    - Example:
      ```json
      "destination": "https://sogang-teambuilder-backend.onrender.com/api/:path*"
      ```
    - Commit and push this change to GitHub.

2.  **Create Project on Vercel**
    - Go to [Vercel Dashboard](https://vercel.com/dashboard).
    - Click **Add New** -> **Project**.
    - Import your GitHub repository.

3.  **Configure Project**
    - **Framework Preset**: Other (or None)
    - **Root Directory**: `./` (Leave empty or select root)
    - **Build Settings**:
        - Leave everything default (empty).

4.  **Deploy**
    - Click **Deploy**.
    - Your site will be live!

## Part 3: Verification
- Visit your Vercel URL.
- Try to **Sign Up** (this tests the database connection).
- If successful, your deployment is complete!

> [!IMPORTANT]
> If you see errors:
> 1. **"npm error enoent ... package.json"**: This means you missed setting the **Root Directory**.
>    - Go to your Render Service Dashboard -> **Settings** (left side).
>    - Scroll down to "Build & Deploy".
>    - Find **Root Directory** and change it to `server`.
>    - Click **Save Changes**.
>    - Click **Manual Deploy** -> **Deploy latest commit**.
> 2. Check Render logs to see if the server crashed.
> 3. Check Vercel logs to see if the rewrite is failing.
> 4. **MongoDB Usage**:
>    - Go to MongoDB Atlas -> **Network Access**.
>    - Ensure you see `0.0.0.0/0`.
>    - If not, click **+ Add IP Address** -> **Allow Access from Anywhere** -> **Confirm**.
>    - **CRITICAL**: ensure you clicked **Confirm** in the dialog.
>    - Go to **Database Access**. Ensure your user `hrseungjoo_db_user` exists and has a known password.
>    - If you are still stuck, please **COPY THE LOGS** from Render and paste them here. We cannot guess the error without logs!
