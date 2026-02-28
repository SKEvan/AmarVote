# AmarVote Deployment Guide - Vercel

## Prerequisites

Before deploying to Vercel, ensure you have:

1. **MongoDB Atlas Account** (Production Database)
   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster (Free tier M0 is sufficient for testing)
   - Create a database user with read/write permissions
   - Whitelist Vercel's IP addresses (or use 0.0.0.0/0 for all IPs)
   - Get your connection string

2. **Vercel Account**
   - Sign up at [Vercel](https://vercel.com)
   - Connect your GitHub account

3. **Git Repository**
   - Ensure your code is pushed to GitHub

## Deployment Steps

### Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new project: "AmarVote Production"
3. Build a cluster (Free M0 tier)
4. Create a database user:
   - Database Access → Add New Database User
   - Username: `amarvote-prod`
   - Password: Generate a secure password
   - Save the credentials securely

5. Configure Network Access:
   - Network Access → Add IP Address
   - Add `0.0.0.0/0` (Allow access from anywhere) for Vercel
   - Note: This is required for serverless functions

6. Get Connection String:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<database>` with `election-monitoring`
   - Example: `mongodb+srv://amarvote-prod:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/election-monitoring?retryWrites=true&w=majority`

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Import Project**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select the AmarVote repository

2. **Configure Project**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Environment Variables**
   Click "Environment Variables" and add:

   ```
   Name: MONGODB_URI
   Value: mongodb+srv://amarvote-prod:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/election-monitoring?retryWrites=true&w=majority
   ```

   ```
   Name: JWT_SECRET
   Value: [Generate a secure random string - see below]
   ```

   **To generate JWT_SECRET:** Run in terminal:
   ```bash
   openssl rand -base64 32
   ```
   Copy the output and paste as JWT_SECRET value

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (2-3 minutes)
   - Your app will be live at: `https://your-project-name.vercel.app`

#### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd "/Users/skevan/Documents/Codes 101/NextJS/Final Backend Update/AmarVote"
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add MONGODB_URI
   # Paste your MongoDB Atlas connection string

   vercel env add JWT_SECRET
   # Paste your generated JWT secret
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Step 3: Seed Production Database (Optional)

If you want to seed your production database with initial data:

1. **Update seed script for production**
   - Use the production MongoDB URI temporarily in your local .env.local
   - Run: `npm run seed`
   - Restore your local MongoDB URI

2. **Or run seed script with production URI directly**
   ```bash
   MONGODB_URI="your-production-uri" npm run seed
   ```

**Warning:** Be careful when seeding production! Consider using a staging environment first.

### Step 4: Post-Deployment Verification

1. **Test the Application**
   - Visit your Vercel URL
   - Register a new user
   - Login and test features
   - Report an incident with GPS
   - Check map functionality
   - Test profile updates

2. **Monitor Logs**
   - Go to Vercel Dashboard → Your Project → Logs
   - Check for any errors or warnings
   - Monitor function execution times

3. **Check MongoDB**
   - Open MongoDB Atlas
   - Browse Collections → election-monitoring
   - Verify data is being created correctly

## Important Configuration Notes

### Database Connection

Your app uses MongoDB connection pooling for serverless functions. The connection is cached globally to prevent exhausting database connections.

### API Routes

All API routes are serverless functions on Vercel:
- `/api/auth/*` - Authentication endpoints
- `/api/users` - User management
- `/api/incidents/*` - Incident management
- `/api/polling-centers` - Polling center data
- `/api/votes` - Vote tracking

Each function has:
- Max duration: 10 seconds (Hobby plan)
- Memory: 1024 MB
- Region: iad1 (US East)

### Environment Variables

Required environment variables:
- `MONGODB_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: Secret key for JWT token signing

### Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed by Vercel
4. SSL certificate is automatically provisioned

## Troubleshooting

### Build Errors

If build fails with TypeScript errors:
```bash
# Run locally to check
npm run build
```

Fix any TypeScript errors before deploying.

### Database Connection Issues

If you see "Failed to connect to MongoDB":
1. Check MongoDB Atlas network access (whitelist 0.0.0.0/0)
2. Verify connection string in environment variables
3. Ensure database user has correct permissions
4. Check if cluster is paused (free tier auto-pauses after inactivity)

### API Route Timeouts

If functions timeout (10s limit on Hobby plan):
1. Optimize database queries
2. Add indexes to frequently queried fields
3. Consider upgrading to Pro plan for 60s timeout

### Environment Variables Not Working

1. Make sure variables are set for Production environment
2. Redeploy after adding/updating variables
3. Check variable names match exactly (case-sensitive)

## Production Best Practices

1. **Security**
   - Use strong JWT_SECRET (min 32 characters)
   - Enable MongoDB Atlas IP whitelisting if possible
   - Regularly rotate JWT secrets
   - Implement rate limiting for API routes

2. **Performance**
   - Add database indexes for frequently queried fields
   - Use MongoDB connection pooling (already implemented)
   - Monitor function execution times
   - Consider caching frequently accessed data

3. **Monitoring**
   - Set up Vercel monitoring for function errors
   - Configure MongoDB Atlas alerts for high connection count
   - Monitor database size and performance
   - Set up uptime monitoring (UptimeRobot, etc.)

4. **Backups**
   - Enable MongoDB Atlas automatic backups
   - Export important data regularly
   - Keep backup of environment variables

## Useful Commands

```bash
# Check deployment status
vercel ls

# View logs
vercel logs

# Remove deployment
vercel remove [deployment-url]

# View environment variables
vercel env ls

# Pull environment variables to local
vercel env pull
```

## Support

- Vercel Documentation: https://vercel.com/docs
- Next.js Documentation: https://nextjs.org/docs
- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com/

## Next Steps After Deployment

1. ✅ Test all features in production
2. ✅ Add custom domain (optional)
3. ✅ Set up monitoring and alerts
4. ✅ Configure automatic deployments from main branch
5. ✅ Add staging environment for testing before production
6. ✅ Implement analytics (Google Analytics, Vercel Analytics)
7. ✅ Set up error tracking (Sentry, etc.)
