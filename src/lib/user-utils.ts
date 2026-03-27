import prisma from "@/lib/db";

/**
 * Ensures a user exists in the database for the given clerkId
 * Creates the user if they don't exist
 */
export async function ensureUserExists(clerkId: string): Promise<void> {
  try {
    // Use upsert to handle race conditions - creates if doesn't exist, does nothing if exists
    await prisma.user.upsert({
      where: { clerkId },
      update: {}, // Don't update anything if user exists
      create: {
        clerkId,
      },
    });
  } catch (error) {
    console.error(`Error ensuring user exists for clerkId ${clerkId}:`, error);
    throw error;
  }
}

/**
 * Wrapper function to handle database operations that might fail due to missing user
 * Automatically creates the user if needed and retries the operation
 */
export async function withUserEnsured<T>(
  clerkId: string,
  operation: () => Promise<T>
): Promise<T> {
  // Proactively ensure user exists before attempting the operation
  await ensureUserExists(clerkId);
  
  // Now perform the operation
  return await operation();
}