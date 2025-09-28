# API Setup Guide

This guide will help you configure the required API keys for the Food Nutrition Analyzer feature.

## Required APIs

### 1. Hugging Face API (for image classification)

**Purpose**: Identifies food items from uploaded images

**Steps to get API token**:
1. Go to [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Sign up or log in to your account
3. Click "New token"
4. Give it a name (e.g., "Calai Food Analyzer")
5. Select "Read" permissions
6. Copy the generated token

**Add to .env file**:
```
NEXT_PUBLIC_HF_TOKEN=hf_your_token_here
```

### 2. Nutritionix API (for nutrition data)

**Purpose**: Provides detailed nutrition information for food items

**Steps to get API credentials**:
1. Go to [Nutritionix API](https://www.nutritionix.com/business/api)
2. Sign up for a free account
3. Go to your dashboard
4. Copy your App ID and App Key

**Add to .env file**:
```
NEXT_PUBLIC_NUTRITIONIX_APP_ID=your_app_id_here
NEXT_PUBLIC_NUTRITIONIX_APP_KEY=your_app_key_here
```

## Complete .env Configuration

Your `.env` file should look like this:

```env
# Database
DATABASE_URL=postgresql://neondb_owner:npg_ZVK1XO8SmDoT@ep-green-math-a1pnoba3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_placeholder
CLERK_SECRET_KEY=sk_test_placeholder

# API Keys for Food Nutrition Analyzer
NEXT_PUBLIC_HF_TOKEN=hf_your_huggingface_token_here
NEXT_PUBLIC_NUTRITIONIX_APP_ID=your_nutritionix_app_id_here
NEXT_PUBLIC_NUTRITIONIX_APP_KEY=your_nutritionix_app_key_here
```

## Troubleshooting

### 401 Authentication Error
- **Cause**: Invalid or missing API tokens
- **Solution**: 
  1. Verify your tokens are correct
  2. Make sure tokens are properly added to `.env` file
  3. Restart your development server after adding tokens

### 503 Service Unavailable
- **Cause**: Hugging Face model is loading
- **Solution**: Wait a few minutes and try again

### 429 Rate Limit Exceeded
- **Cause**: Too many API requests
- **Solution**: Wait before making more requests

### No Results Found
- **Cause**: Food item not recognized or not in database
- **Solution**: Try different food names or upload clearer images

## Free Tier Limits

### Hugging Face
- Free tier includes limited requests
- Consider upgrading for production use

### Nutritionix
- Free tier includes 1,000 requests per month
- Upgrade for higher limits

## Security Notes

- Never commit your `.env` file to version control
- Use environment variables for all API keys
- Consider using different keys for development and production
