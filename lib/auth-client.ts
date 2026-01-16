// Auth client placeholder
// TODO: Implement authentication client

export const authClient = {
  useSession: () => ({ data: null, isPending: false }),
}

// Named exports for compatibility
export const useSession = authClient.useSession

export async function signIn(provider?: string, options?: any) {
  throw new Error('Not implemented')
}

export async function signOut() {
  throw new Error('Not implemented')
}
