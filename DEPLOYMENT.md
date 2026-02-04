# WageFlow - Vercel Deployment Guide

## Environment Variables

Make sure to set the following environment variables in your Vercel project settings:

### Required Variables

1. **DATABASE_URL**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/wageflow?retryWrites=true&w=majority&tls=true&tlsAllowInvalidCertificates=false
   ```
   - Replace `username`, `password`, and `cluster` with your MongoDB Atlas credentials
   - Make sure the database name is `wageflow` (or your preferred name)
     mongodb+srv://username:password@cluster.mongodb.net/wageflow?retryWrites=true&w=majority&ssl=true
     ```

2. **NEXTAUTH_SECRET**
   ```
   Generate a secure random string (at least 32 characters)
   
   - Or use: https://generate-secret.vercel.app/32

3. **NEXTAUTH_URL**
   ```
   https://your-app-name.vercel.app
   ```
   - Replace with your actual Vercel deployment URL
   - For production, use your custom domain if you have one

## Deployment Steps

1. **Push your code to GitHub** (already done)

2. **Import project to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository: `Snag-hub/WageFlow`

3. **Configure Environment Variables**
   - In Vercel dashboard, go to: Settings → Environment Variables
   - Add all three variables listed above
   - Make sure to add them for all environments (Production, Preview, Development)

4. **Deploy**
   - Vercel will automatically deploy on every push to main
   - The `postinstall` script will run `prisma generate` automatically

## Troubleshooting

### "Server selection timeout" or "InternalError" on signup
This is a TLS/SSL connection issue. **Fix:**

1. **Update your DATABASE_URL** in Vercel environment variables:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/wageflow?retryWrites=true&w=majority&tls=true&tlsAllowInvalidCertificates=false
   ```
   
2. **If that doesn't work**, try this alternative:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/wageflow?retryWrites=true&w=majority&ssl=true
   ```

3. **Redeploy** after updating the environment variable:
   - Go to Vercel Dashboard → Deployments
   - Click the three dots on the latest deployment
   - Select "Redeploy"

4. **Check MongoDB Atlas version**:
   - Ensure you're using MongoDB 4.4 or higher
   - Older versions may have TLS compatibility issues with Vercel

### "Internal server error" on signup
- Check Vercel logs: https://vercel.com/your-project/logs
- Verify `DATABASE_URL` is correctly set
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0) or add Vercel's IP ranges

### Prisma Client errors
- The `postinstall` script should handle this automatically
- If issues persist, check build logs for Prisma generation errors

### Authentication not working
- Verify `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your deployment URL
- Check that cookies are not being blocked

## MongoDB Atlas Setup

1. **Network Access**
   - Go to Network Access in MongoDB Atlas
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - This is required for Vercel deployments

2. **Database User**
   - Ensure you have a database user with read/write permissions
   - Use these credentials in your `DATABASE_URL`

## Post-Deployment Verification

1. Visit your deployed site
2. Try creating an account at `/auth/signup`
3. If successful, try logging in at `/auth/login`
4. Check that the dashboard loads correctly

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check MongoDB Atlas logs
3. Verify all environment variables are set correctly
4. Ensure the database name in `DATABASE_URL` matches your schema
