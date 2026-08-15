export interface Mention {
  username: string;
  index: number;
  length: number;
}

/**
 * Parse @mentions from text
 * @param text - The text to parse for mentions
 * @returns Array of mention objects with username, index, and length
 */
export function parseMentions(text: string): Mention[] {
  const mentions: Mention[] = [];
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push({
      username: match[1],
      index: match.index,
      length: match[0].length,
    });
  }

  return mentions;
}

/**
 * Extract unique usernames from mentions
 * @param text - The text to extract mentions from
 * @returns Array of unique usernames
 */
export function extractMentionedUsernames(text: string): string[] {
  const mentions = parseMentions(text);
  const usernames = new Set(mentions.map((m) => m.username));
  return Array.from(usernames);
}

/**
 * Check if text contains any mentions
 * @param text - The text to check
 * @returns True if text contains mentions
 */
export function hasMentions(text: string): boolean {
  return /@[a-zA-Z0-9_]/.test(text);
}

/**
 * Replace mentions with markdown-style links
 * @param text - The text to format
 * @returns Text with mentions formatted as markdown links
 */
export function formatMentionsAsMarkdown(text: string): string {
  const mentions = parseMentions(text);
  let result = text;
  let offset = 0;

  mentions.forEach((mention) => {
    const actualIndex = mention.index + offset;
    const before = result.slice(0, actualIndex);
    const after = result.slice(actualIndex + mention.length);
    result = `${before}[@${mention.username}](/u/${mention.username})${after}`;
    offset += `[@${mention.username}](/u/${mention.username})`.length - mention.length;
  });

  return result;
}

/**
 * Strip @ symbols from usernames for display
 * @param username - The username with or without @
 * @returns Username without @
 */
export function stripAtSymbol(username: string): string {
  return username.startsWith('@') ? username.slice(1) : username;
}
