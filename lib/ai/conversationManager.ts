export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface UserProfileSummary {
  qualification: string
  pcmAverage: number | null
  age: number | null
  category: string
  targetDepartment: string | null
}

export interface ConversationContext {
  sessionId: string
  messages: Message[]
  summary: string | null
  userProfile: UserProfileSummary | null
  pageContext: string | null
}

export function buildConversationSummary(messages: Message[]): string {
  const recent = messages.slice(-8).filter((m) => m.role !== 'system')
  if (recent.length === 0) return ''
  const topics = recent
    .filter((m) => m.role === 'user')
    .map((m) => m.content.slice(0, 60))
    .join('; ')
  return `User asked about: ${topics}. Conversation covered maritime career topics in India.`
}

export function getRecentMessages(messages: Message[], maxMessages = 6): Message[] {
  if (messages.length <= maxMessages) return messages
  return [messages[0], ...messages.slice(-maxMessages + 1)]
}

export function buildUserContextString(profile: UserProfileSummary | null): string {
  if (!profile) return 'User profile not available'
  const parts: string[] = []
  if (profile.qualification) parts.push(`User qualification: ${profile.qualification}`)
  if (profile.pcmAverage !== null) parts.push(`PCM Average: ${profile.pcmAverage}%`)
  if (profile.age !== null) parts.push(`Age: ${profile.age}`)
  if (profile.category) parts.push(`Category: ${profile.category}`)
  if (profile.targetDepartment) parts.push(`Target: ${profile.targetDepartment} Department`)
  return parts.join(', ')
}
