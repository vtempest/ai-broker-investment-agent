# KYC Verification Integration with Didit.me

This document explains how the KYC (Know Your Customer) verification is integrated into the investment prediction agent using Didit.me.

## Overview

The application uses [Didit.me](https://didit.me) for identity verification. Didit provides a secure, AI-powered KYC solution that includes:
- ID document verification
- Liveness detection
- Face matching
- Comprehensive compliance checks

## Setup Instructions

### 1. Create a Didit Account

1. Sign up at the [Didit Business Console](https://console.didit.me)
2. Create an "Application" in the console
3. Navigate to "Workflows" and create a KYC workflow:
   - Enable ID document verification
   - Enable liveness detection
   - Enable face matching
   - Configure any additional checks as needed
4. Copy the `workflow_id` from your workflow

### 2. Get API Credentials

1. In the Didit Console, go to "API & Webhooks"
2. Copy your `API Key`
3. Copy your `Webhook Secret Key`
4. Configure your webhook URL: `https://yourdomain.com/api/webhooks/didit`

### 3. Configure Environment Variables

Add the following to your `.env` file:

```bash
# KYC Verification (Didit.me)
DIDIT_API_KEY=your_api_key_here
DIDIT_WORKFLOW_ID=your_workflow_id_here
DIDIT_WEBHOOK_SECRET=your_webhook_secret_here
```

### 4. Update Database Schema

Run the database migration to add the KYC fields:

```bash
npm run db:generate
npm run db:push
```

This will add the following fields to the users table:
- `kycStatus` - Current KYC verification status
- `kycSessionId` - Didit session ID
- `kycVerifiedAt` - Timestamp of verification approval

## Architecture

### Database Schema

The KYC integration adds three fields to the `users` table:

```typescript
// KYC Verification (Didit.me)
kycStatus: text("kyc_status").default("not_started")
// Possible values: not_started, pending, in_review, approved, rejected, abandoned

kycSessionId: text("kyc_session_id")
// Stores the Didit verification session ID

kycVerifiedAt: integer("kyc_verified_at", { mode: "timestamp" })
// Timestamp when KYC was approved
```

### API Endpoints

#### POST /api/kyc/start

Initiates a KYC verification session.

**Request:** Authenticated user (via session)

**Response:**
```json
{
  "success": true,
  "sessionId": "session_abc123",
  "url": "https://verification.didit.me/session/abc123"
}
```

**Workflow:**
1. Checks if user already has approved KYC
2. Creates a new Didit verification session
3. Updates user's `kycStatus` to "pending"
4. Returns the verification URL for the user to complete

#### GET /api/kyc/start

Returns the current KYC status for the authenticated user.

**Response:**
```json
{
  "status": "approved",
  "verifiedAt": "2025-12-18T10:30:00Z"
}
```

#### POST /api/webhooks/didit

Webhook endpoint that receives status updates from Didit.

**Security:** Verifies webhook signature using HMAC-SHA256

**Workflow:**
1. Verifies the webhook signature
2. Extracts session_id and status from the payload
3. Finds the user by session_id or external_id
4. Maps Didit status to internal status
5. Updates user's KYC status in the database
6. Sets `kycVerifiedAt` if status is "approved"

**Status Mapping:**
- `approved` → `approved`
- `declined` → `rejected`
- `in_review` → `in_review`
- `abandoned` → `abandoned`
- `pending` → `pending`

### Frontend Components

The KYC verification UI is integrated into the Settings dialog (`components/settings/settings-dialog.tsx`).

**Features:**
- Real-time status display with color-coded badges
- Start verification button
- Status polling (checks every 5 seconds during verification)
- Pop-up window for Didit verification flow
- Helpful instructions and requirements
- Timestamp display for verified accounts

**Status Indicators:**
- ✅ **Verified** (green) - KYC approved
- ❌ **Rejected** (red) - KYC not approved
- ⏱️ **Under Review** (yellow) - In review or pending
- ⚠️ **Incomplete** (gray) - Verification abandoned
- ⚠️ **Not Started** (gray) - No verification attempted

## User Flow

1. User navigates to Settings → General
2. Sees KYC Verification card with current status
3. Clicks "Start KYC Verification" button
4. New window opens with Didit verification flow
5. User completes:
   - ID document upload (front and back)
   - Selfie with liveness detection
   - Face matching
6. Didit processes verification (instant for most cases)
7. Webhook updates user status in our database
8. Frontend polls and updates status display
9. User sees "Verified" badge once approved

## Integration Example

Here's a complete example of how to integrate the Didit KYC workflow:

```typescript
// 1. Create a verification session
const response = await fetch("/api/kyc/start", {
  method: "POST",
});

const { sessionId, url } = await response.json();

// 2. Open the verification flow
window.open(url, "_blank", "width=800,height=900");

// 3. Poll for status updates
const pollInterval = setInterval(async () => {
  const statusResponse = await fetch("/api/kyc/start");
  const { status } = await statusResponse.json();

  if (status !== "pending") {
    clearInterval(pollInterval);

    if (status === "approved") {
      // User is verified!
      console.log("KYC verification approved");
    }
  }
}, 5000);
```

## Webhook Signature Verification

Didit signs all webhook requests using HMAC-SHA256. Here's how it's verified:

```typescript
function verifyDiditSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.DIDIT_WEBHOOK_SECRET;

  const computed = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(computed),
    Buffer.from(signature)
  );
}
```

## Error Handling

- **Missing credentials**: Returns 500 with "KYC service not configured"
- **Invalid signature**: Returns 400 with "Invalid signature"
- **User not found**: Returns 200 to prevent retries (logged for investigation)
- **Didit API errors**: Returns error details from Didit response

## Testing

### Test the Webhook Endpoint

You can test that the webhook endpoint is active:

```bash
curl https://yourdomain.com/api/webhooks/didit
```

Response:
```json
{
  "message": "Didit webhook endpoint is active",
  "timestamp": "2025-12-18T10:30:00.000Z"
}
```

### Test KYC Flow (Development)

1. Ensure all environment variables are set
2. Start the development server: `npm run dev`
3. Navigate to Settings → General
4. Click "Start KYC Verification"
5. Complete the verification in the Didit flow
6. Monitor the webhook logs for incoming updates
7. Verify the status updates in the UI

## Production Checklist

Before deploying KYC verification to production:

- [ ] Didit account created with production credentials
- [ ] KYC workflow configured and tested
- [ ] Environment variables set in production
- [ ] Database migration applied
- [ ] Webhook URL configured in Didit Console
- [ ] Webhook endpoint accessible (not behind VPN/firewall)
- [ ] SSL certificate valid for webhook domain
- [ ] Error monitoring configured for webhook endpoint
- [ ] Test complete KYC flow end-to-end
- [ ] Document internal KYC review process (if manual review needed)

## Compliance & Privacy

- User identity data is processed by Didit according to their privacy policy
- Only KYC status and verification timestamp are stored in our database
- No ID documents or biometric data are stored in our system
- Users can view their verification status at any time
- Rejected verifications should be reviewed manually if needed

## Support & Troubleshooting

### Common Issues

**1. Webhook not receiving updates**
- Verify webhook URL is publicly accessible
- Check Didit Console webhook logs
- Ensure DIDIT_WEBHOOK_SECRET matches Console value

**2. "KYC service not configured" error**
- Verify all three environment variables are set
- Check for typos in variable names
- Restart the application after adding variables

**3. User stuck in "pending" status**
- Check Didit Console for session status
- Verify webhook is being called
- Check server logs for webhook errors
- User may need to restart verification

### Getting Help

- **Didit Documentation**: https://docs.didit.me
- **Didit Support**: support@didit.me
- **Didit Console**: https://console.didit.me

## References

- [Didit.me Homepage](https://didit.me)
- [Didit API Documentation](https://docs.didit.me)
- [Didit KYC Integration Guide](https://didit.me/blog/how-to-integrate-kyc-api/)
- [Didit Business Console](https://console.didit.me)
