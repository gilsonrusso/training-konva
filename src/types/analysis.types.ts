export type RequirementItem = {
  id_: string
  name: string
}

export type AnalysisListUseState = {
  id: string
  name: string
  requirements: RequirementItem[]
}

export interface AnalysisListResponse {
  id: string
  name: string
  requirements: string[]
}
