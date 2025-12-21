#!/bin/bash

# Script to get Stripe webhook secret for local development

echo "🔐 Getting Stripe Webhook Secret"
echo ""
echo "Step 1: Make sure you're logged in to Stripe CLI"
echo "If not logged in, run: stripe login"
echo ""
read -p "Press Enter when you're logged in..."

echo ""
echo "Step 2: Starting webhook listener..."
echo "This will forward webhooks to: http://localhost:3000/api/stripe/webhook"
echo ""
echo "⚠️  IMPORTANT: Keep this terminal window open!"
echo "⚠️  The webhook secret will be displayed below:"
echo ""
echo "----------------------------------------"
echo ""

# Run stripe listen and extract the webhook secret
stripe listen --forward-to localhost:3000/api/stripe/webhook 2>&1 | while IFS= read -r line; do
  echo "$line"
  
  # Extract webhook secret from the output
  if [[ $line =~ whsec_[a-zA-Z0-9]+ ]]; then
    SECRET=$(echo "$line" | grep -o 'whsec_[a-zA-Z0-9]*' | head -1)
    if [ ! -z "$SECRET" ]; then
      echo ""
      echo "----------------------------------------"
      echo "✅ Webhook Secret Found:"
      echo "$SECRET"
      echo ""
      echo "Add this to your .env.local file:"
      echo "STRIPE_WEBHOOK_SECRET=$SECRET"
      echo "----------------------------------------"
    fi
  fi
done

