export type CurrentUser = {
  name: string;
  email: string;
};

// Placeholder for the real session lookup; replace with the auth client once
// the auth feature lands so nothing else has to change.
export const currentUser: CurrentUser = {
  name: 'Jane Doe',
  email: 'jane@lumen.io',
};

export function userInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}
