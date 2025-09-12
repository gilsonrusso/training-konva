import { Stack } from '@mui/material'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import type { GridColDef, GridRowsProp } from '@mui/x-data-grid'
import { lazy, Suspense } from 'react'

const LazyDataGrid = lazy(() =>
  import('@mui/x-data-grid').then((module) => ({ default: module.DataGrid }))
)

const columns: GridColDef<GridRowsProp[number]>[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  {
    field: 'firstName',
    headerName: 'First name',
    width: 150,
    editable: true,
  },
  {
    field: 'lastName',
    headerName: 'Last name',
    width: 150,
    editable: true,
  },
  {
    field: 'age',
    headerName: 'Age',
    type: 'number',
    width: 110,
    editable: true,
  },
  {
    field: 'fullName',
    headerName: 'Full name',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 160,
    valueGetter: (_, row) => `${row.firstName || ''} ${row.lastName || ''}`,
  },
]

const rows = [
  { id: 1, lastName: 'Snow', firstName: 'Jon', age: 14 },
  { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 31 },
  { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 31 },
  { id: 4, lastName: 'Stark', firstName: 'Arya', age: 11 },
  { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
  { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
  { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
  { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
  { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
]

export default function TrainingHistoryPage() {
  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <Suspense
        fallback={
          <Stack spacing={1}>
            <Skeleton variant="rectangular" width="100%" height={52} />
            <Skeleton variant="rectangular" width="100%" height={30} />
            <Skeleton variant="rectangular" width="100%" height={30} />
            <Skeleton variant="rectangular" width="100%" height={30} />
            <Skeleton variant="rectangular" width="100%" height={30} />
            <Skeleton variant="rectangular" width="100%" height={30} />
          </Stack>
        }
      >
        <LazyDataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          pageSizeOptions={[5]}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Suspense>
    </Box>
  )
}
