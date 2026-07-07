// Domain types mirroring backend DTOs

export type UserRole = 'Student' | 'Admin'
export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export interface AuthUser {
  username: string
  email: string
  role: UserRole
  totalPoints: number
}

export interface AuthResponse {
  token: string
  username: string
  email: string
  role: UserRole
  totalPoints: number
  expiresAt: string
}

export interface ChallengeSummary {
  id: string
  title: string
  difficulty: Difficulty
  points: number
  isActive: boolean
}

export interface Challenge {
  id: string
  title: string
  description: string
  difficulty: Difficulty
  initialConfig: string
  targetRequirements: string
  points: number
  isActive: boolean
  createdAt: string
}

export interface SubmissionResult {
  id: string
  isPassed: boolean
  score: number
  aiFeedback: string | null
  submittedAt: string
}

export interface Submission {
  id: string
  userId: string
  username: string
  challengeId: string
  challengeTitle: string
  submittedConfig: string
  score: number
  aiFeedback: string | null
  isPassed: boolean
  submittedAt: string
}

export interface PaginatedResponse<T> {
  total: number
  page: number
  pageSize: number
  data: T[]
}

export interface ApiError {
  message: string
}
