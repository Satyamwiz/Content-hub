import prisma from "@/lib/db";

export interface ClerkUserPayload {
  id?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email_addresses?: Array<{ email_address?: string; primary?: boolean }>;
  primary_email_address?: string;
  profile_image_url?: string;
  public_metadata?: any;
  private_metadata?: any;
}

export class ClerkSyncService {
  static normalizeEmail(payload: any): string | null {
    if (!payload) return null;
    if (payload.primary_email_address) return payload.primary_email_address;
    if (
      Array.isArray(payload.email_addresses) &&
      payload.email_addresses.length
    ) {
      const primary = payload.email_addresses.find(
        (e: any) => e.primary === true
      );
      return (
        (primary && primary.email_address) ||
        payload.email_addresses[0].email_address ||
        null
      );
    }
    if (payload.email) return payload.email;
    return null;
  }

  static normalizeFullName(payload: any): string | null {
    if (!payload) return null;
    if (payload.full_name) return payload.full_name;
    const first = payload.first_name || payload.given_name || "";
    const last = payload.last_name || payload.family_name || "";
    const combined = `${first} ${last}`.trim();
    return combined || null;
  }

  static async upsertClerkUser(payload: ClerkUserPayload) {
    const clerkId = payload.id as string | undefined;
    if (!clerkId) {
      return {
        success: false,
        error: "Missing clerk user id in webhook payload",
      };
    }

    const fullName = this.normalizeFullName(payload) || undefined;
    const email = this.normalizeEmail(payload) || undefined;
    const imageUrl =
      (payload as any).profile_image_url ||
      (payload as any).image_url ||
      undefined;

    try {
      // Cast the data payload to any to avoid mismatches with generated Prisma client typings
      const upsertData: any = {
        clerkId,
        fullName,
        primaryEmail: email,
        imageUrl,
        publicMetadata: (payload as any).public_metadata ?? undefined,
        privateMetadata: (payload as any).private_metadata ?? undefined,
      };

      const user = await prisma.user.upsert({
        where: { clerkId },
        update: upsertData as any,
        create: upsertData as any,
      });

      return { success: true, user };
    } catch (err) {
      console.error("Failed to upsert Clerk user:", err);
      return { success: false, error: (err as Error).message };
    }
  }
}

export default ClerkSyncService;
