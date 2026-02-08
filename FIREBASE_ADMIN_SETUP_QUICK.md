# Quick Setup: Add These 3 Lines to .env.local

After you download the Firebase service account JSON file, add these 3 lines to your `.env.local` file:

```bash
# Firebase Admin SDK (add these at the end of .env.local)
FIREBASE_ADMIN_PROJECT_ID=placement-32f7a
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@placement-32f7a.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_actual_private_key_here\n-----END PRIVATE KEY-----\n"
```

## How to Get the Values:

1. **Download JSON from Firebase Console:**
   - Go to: https://console.firebase.google.com/project/placement-32f7a/settings/serviceaccounts/adminsdk
   - Click "Generate New Private Key"
   - Download the JSON file

2. **Copy Values from JSON:**
   - Open the downloaded JSON file
   - Copy `project_id` → use as `FIREBASE_ADMIN_PROJECT_ID`
   - Copy `client_email` → use as `FIREBASE_ADMIN_CLIENT_EMAIL`  
   - Copy `private_key` → use as `FIREBASE_ADMIN_PRIVATE_KEY` (keep the quotes!)

3. **Restart Dev Server:**
   ```bash
   # Press Ctrl+C to stop
   npm run dev
   ```

## ⚠️ Important Notes:

- Keep the **double quotes** around the private key
- Keep the `\n` characters in the private key (don't replace them)
- The private key should look like: `"-----BEGIN PRIVATE KEY-----\nMIIE...lots of text...\n-----END PRIVATE KEY-----\n"`

## Alternative: Quick Test Without Setup

If you want to test immediately without Firebase Admin setup:

1. Go to `/auth/register`
2. Register with email: `recruiter@test.com`
3. Password: `test123456`
4. Select role: **Recruiter**
5. Now you can login with those credentials!

This creates the account manually, but once you add Firebase Admin credentials, the admin portal will create accounts automatically.
