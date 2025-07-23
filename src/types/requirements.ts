export interface CreatedListItem {
  id_: string
  name: string
}

export interface FetchedCreatedList {
  id: string
  name: string
  requirements: CreatedListItem[]
}
