/**
 * Teaching fixture only.
 * This file is not part of the PREIshare TanStack app.
 * Do not import it from application code.
 * Contact values below are fake. They are not a real member.
 */

export type MemberContact = {
  displayName: string
  email: string
  phone: string
}

export type PublicSharePreview = {
  title: string
  summary: string
  memberEmail: string
  memberPhone: string
}

/** Builds the preview card shown when a sponsor shares a listing link publicly. */
export function buildPublicSharePreview(member: MemberContact, listingTitle: string): PublicSharePreview {
  return {
    title: `PREIshare: ${listingTitle}`,
    summary: `${member.displayName} shared a property listing`,
    memberEmail: member.email,
    memberPhone: member.phone,
  }
}

export const sampleMember: MemberContact = {
  displayName: 'Sample Member',
  email: 'example@example.com',
  phone: '+1-555-010-0199',
}

export const samplePreview: PublicSharePreview = buildPublicSharePreview(
  sampleMember,
  'Lakeside A-frame on a private cove',
)
