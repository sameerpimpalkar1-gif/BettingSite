# Deployment Guide

## Prerequisites

1. A Netlify account
2. A GitHub account
3. MongoDB Atlas database (already configured)

## Step-by-Step Deployment

### 1. Install Dependencies

Since PowerShell script execution is disabled, you'll need to enable it or use an alternative method:

**Option A: Enable PowerShell Scripts (Recommended)**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then run:
```bash
npm install
```

**Option B: Use Command Prompt**
Open Command Prompt (cmd.exe) instead of PowerShell and run:
```bash
npm install
```

### 2. Create .env File

Create a file named `.env` in the root directory with this content:

```env
MONGODB_URI=mongodb+srv://iammrspidey_db_user:nihal123@cluster0.96o6drn.mongodb.net/colorprediction
JWT_SECRET=super_secret_jwt_key_change_in_production_12345
```

### 3. Test Locally

```bash
npm run dev
```

Visit `http://localhost:5173` to test the application.

### 4. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - Color Prediction Game"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 5. Deploy to Netlify

#### Option A: Netlify Dashboard (Easiest)

1. Go to [Netlify](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub and select your repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
5. Add environment variables:
   - Click "Advanced" → "New variable"
   - Add `MONGODB_URI` with your MongoDB connection string
   - Add `JWT_SECRET` with a strong secret key
6. Click "Deploy site"

#### Option B: Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

### 6. Configure Environment Variables in Netlify

After deployment:

1. Go to your site in Netlify dashboard
2. Navigate to "Site settings" → "Environment variables"
3. Add the following variables:
    - `MONGODB_URI`: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/colorprediction`
    - `JWT_SECRET`: `your_strong_secret_key` (generate a secure random string)

### 7. Verify Deployment

1. Visit your Netlify URL
2. Test user registration and login
3. Test placing bets
4. Test admin panel at `/admin`
   - Email: `developer@qms.com`
   - Password: `password123`

## Troubleshooting

### Build Fails

- Check that all dependencies are installed
- Verify environment variables are set in Netlify
- Check the build logs in Netlify dashboard

### Functions Not Working

- Ensure `netlify.toml` is in the root directory
- Verify the functions directory is set to `netlify/functions`
- Check function logs in Netlify dashboard

### Database Connection Issues

- Verify MongoDB Atlas allows connections from all IPs (0.0.0.0/0)
- Check that the MongoDB URI is correct
- Ensure the database user has read/write permissions

### CORS Issues

- All functions already include CORS headers
- If issues persist, check Netlify function logs

## Post-Deployment

### Security Recommendations

1. Change the JWT_SECRET to a strong, unique value
2. Consider changing admin credentials in the code
3. Enable MongoDB Atlas IP whitelist for production
4. Set up SSL/HTTPS (Netlify provides this automatically)

### Monitoring

- Monitor function logs in Netlify dashboard
- Check MongoDB Atlas metrics for database performance
- Set up error tracking (optional)

## Support

If you encounter any issues:

1. Check the Netlify function logs
2. Verify environment variables are set correctly
3. Test the MongoDB connection
4. Review the browser console for frontend errors
