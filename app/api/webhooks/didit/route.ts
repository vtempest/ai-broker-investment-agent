import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

/**
 * Verifies the Didit webhook signature
 */
function verifyDiditSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.DIDIT_WEBHOOK_SECRET;

  if (!secret) {
    console.error("DIDIT_WEBHOOK_SECRET not configured");
    return false;
  }

  const computed = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(computed),
    Buffer.from(signature)
  );
}

/**
 * Maps Didit status to our internal KYC status
 */
function mapDiditStatus(status: string): string {
  const statusMap: Record<string, string> = {
    approved: "approved",
    declined: "rejected",
    in_review: "in_review",
    abandoned: "abandoned",
    pending: "pending",
  };

  return statusMap[status] || "pending";
}

/**
 * POST /api/webhooks/didit
 * Webhook endpoint for Didit.me KYC verification updates
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get("X-Didit-Signature") || "";

    // Verify webhook signature
    if (!verifyDiditSignature(rawBody, signature)) {
      console.error("Invalid Didit webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Parse the webhook payload
    const event = JSON.parse(rawBody);

    console.log("Received Didit webhook:", {
      type: event.type,
      sessionId: event.data?.session_id,
      status: event.data?.status,
    });

    // Extract relevant data
    const { session_id, status, decision, external_id } = event.data || {};

    if (!session_id || !status) {
      console.error("Missing required fields in webhook payload");
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    // Find user by session ID or external_id
    let user;

    if (external_id) {
      user = await db.query.users.findFirst({
        where: eq(users.id, external_id),
      });
    } else {
      user = await db.query.users.findFirst({
        where: eq(users.kycSessionId, session_id),
      });
    }

    if (!user) {
      console.error("User not found for KYC session:", session_id);
      // Return 200 to prevent Didit from retrying
      return NextResponse.json(
        { message: "User not found, but acknowledged" },
        { status: 200 }
      );
    }

    // Map the status
    const kycStatus = mapDiditStatus(status);

    // Prepare update data
    const updateData: any = {
      kycStatus,
      updatedAt: new Date(),
    };

    // If approved, set the verification timestamp
    if (kycStatus === "approved") {
      updateData.kycVerifiedAt = new Date();
    }

    // Update user's KYC status
    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, user.id));

    console.log(`Updated KYC status for user ${user.id}:`, kycStatus);

    // Log the decision details if available
    if (decision) {
      console.log("KYC Decision details:", {
        userId: user.id,
        decision,
        sessionId: session_id,
      });
    }

    return NextResponse.json({
      message: "Webhook processed successfully",
      userId: user.id,
      status: kycStatus,
    });
  } catch (error: any) {
    console.error("Error processing Didit webhook:", error);

    // Return 200 even on error to prevent Didit from retrying
    // Log the error for investigation
    return NextResponse.json(
      {
        message: "Error processing webhook, but acknowledged",
        error: error.message,
      },
      { status: 200 }
    );
  }
}

/**
 * GET /api/webhooks/didit
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    message: "Didit webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}
