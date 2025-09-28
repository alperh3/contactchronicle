# Supabase Authentication Setup Guide

This guide will help you set up email/password authentication with Supabase for your ContactChronicle application.

## Prerequisites

- A Supabase project (create one at [supabase.com](https://supabase.com))
- Your Supabase project URL and anon key

## Step 1: Configure Supabase Authentication

1. **Go to your Supabase Dashboard**
   - Navigate to your project dashboard
   - Go to **Authentication** → **Settings**

2. **Enable Email Authentication**
   - Under **Auth Providers**, ensure **Email** is enabled
   - Configure your site URL (e.g., `http://localhost:3000` for development)
   - Set up email templates if desired

3. **Configure Email Settings**
   - Go to **Authentication** → **Settings** → **SMTP Settings**
   - Configure your SMTP settings or use Supabase's default email service
   - For development, you can use the default settings

## Step 2: Update Database Schema

1. **Run the Updated Schema**
   - Go to **SQL Editor** in your Supabase dashboard
   - Run the updated `supabase-schema.sql` file
   - This adds `user_id` column and RLS policies

2. **Verify RLS Policies**
   - Go to **Database** → **Tables** → **connections**
   - Ensure Row Level Security is enabled
   - Verify the policies are created correctly

## Step 3: Environment Variables

Create or update your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 4: Test Authentication

1. **Start your development server**
   ```bash
   npm run dev
   ```

2. **Test the authentication flow**
   - Navigate to `http://localhost:3000`
   - You should be redirected to `/auth` if not logged in
   - Try signing up with a new email
   - Check your email for the confirmation link
   - Sign in with your credentials

## Step 5: Verify User-Specific Data

1. **Import some test data**
   - Go to the Import page
   - Upload a CSV file
   - Verify the data is associated with your user

2. **Check data isolation**
   - Create another user account
   - Verify that users can only see their own data
   - Test that data is properly filtered by `user_id`

## Features Implemented

- ✅ Email/password authentication
- ✅ User registration and login
- ✅ Protected routes (Dashboard, Import, Chronicle)
- ✅ User-specific data isolation
- ✅ Automatic session management
- ✅ Sign out functionality
- ✅ Responsive authentication UI

## Security Features

- Row Level Security (RLS) enabled
- User-specific data access policies
- Automatic user ID association with imported data
- Session persistence and auto-refresh
- Secure password handling via Supabase

## Troubleshooting

### Common Issues

1. **"Invalid login credentials"**
   - Check if email confirmation is required
   - Verify email/password are correct
   - Check Supabase auth logs

2. **"RLS policy violation"**
   - Ensure user is authenticated
   - Verify RLS policies are correctly set up
   - Check that `user_id` is being set on insert

3. **"Redirect loop"**
   - Check that environment variables are set correctly
   - Verify Supabase client configuration
   - Ensure auth state is being managed properly

### Debug Steps

1. Check browser console for errors
2. Verify Supabase dashboard logs
3. Test with a fresh browser session
4. Ensure all environment variables are loaded

## Next Steps

- Consider adding social authentication (Google, GitHub, etc.)
- Implement password reset functionality
- Add user profile management
- Set up email notifications for data imports
