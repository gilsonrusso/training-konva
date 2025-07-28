import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { memo } from 'react'
import { useAnalysis } from '../../../../contexts/AnalysisContext'
import { CreatedListComponent } from './CreatedListComponent'

export const CreatedListsSection = memo(function CreatedListsSection() {
  const {
    createdLists,
    availableRequirementsNames,
    onDeleteList: deleteList,
    oneEditList: saveListEdits,
    onSelectingList: selectListForAppStepper, // Função de seleção
    selectedLists: selectedListForAppStepper, // Lista selecionada
  } = useAnalysis()

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                  availableAllRequirementNames={availableRequirementsNames} // Do contexto
                  onDeleteList={deleteList} // Do contexto
                  onSaveList={saveListEdits} // Do contexto
                  isSelected={!!selectedListForAppStepper.find((el) => el.id === list.id)} // Do contexto/estado local mapeado
                  onSelect={selectListForAppStepper} // Do contexto
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
})
