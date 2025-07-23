import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { CreatedListComponent } from './CreatedListComponent'

// Tipos necessários, re-importados ou definidos para este componente
interface CreatedListItem {
  id_: string
  name: string
}

interface FetchedCreatedList {
  id: string
  name: string
  requirements: CreatedListItem[]
}

interface CreatedListsSectionProps {
  createdLists: FetchedCreatedList[]
  availableAllRequirementNames: string[]
  onDeleteList: (listId: string) => void
  onSaveListEdits: (listToSave: FetchedCreatedList) => void
  selectedListIdForStep: string | null
  onSelectCreatedList: (listId: string) => void
}

export const CreatedListsSection = ({
  createdLists,
  availableAllRequirementNames,
  onDeleteList,
  onSaveListEdits,
  selectedListIdForStep,
  onSelectCreatedList,
}: CreatedListsSectionProps) => {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ mb: 2, whiteSpace: 'nowrap' }}>
        List
      </Typography>
      <Box
        sx={{
          flexGrow: 1,
          overflowX: 'auto',
          overflowY: 'hidden',
          pb: 1,
        }}
      >
        {createdLists.length === 0 ? (
          <Typography variant="body2" sx={{ textAlign: 'center', mt: 2, whiteSpace: 'nowrap' }}>
            No lists have been created yet. Select items and click Create New List!
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', gap: 2, height: '100%', minWidth: 'fit-content' }}>
            {createdLists.map((list) => (
              <Box
                key={list.id}
                sx={{
                  minWidth: '300px',
                  maxWidth: '300px',
                  flexShrink: 0,
                  height: '100%',
                }}
              >
                <CreatedListComponent
                  list={list}
                  availableAllRequirementNames={availableAllRequirementNames}
                  onDeleteList={onDeleteList}
                  onSaveList={onSaveListEdits}
                  isSelected={selectedListIdForStep === list.id}
                  onSelect={onSelectCreatedList}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}
