import { intersection, not, union } from '../../../../utils/commons'

export interface AppStepperOneState {
  checkedRequirementNames: readonly string[]
  newListName: string
}

export enum ActionTypes {
  SET_NEW_LIST_NAME,
  TOGGLE_REQUIREMENT,
  TOGGLE_ALL_REQUIREMENTS,
  RESET_FORM,
}

type ActionSetNewListName = {
  type: ActionTypes.SET_NEW_LIST_NAME
  payload: string
}

type ActionToggleRequirement = {
  type: ActionTypes.TOGGLE_REQUIREMENT
  payload: string
}

type ActionToggleAllRequirements = {
  type: ActionTypes.TOGGLE_ALL_REQUIREMENTS
  payload: {
    itemsToToggle: readonly string[]
  }
}

type ActionResetForm = {
  type: ActionTypes.RESET_FORM
}

export type AppStepperOneAction =
  | ActionSetNewListName
  | ActionToggleRequirement
  | ActionToggleAllRequirements
  | ActionResetForm

export function appStepperOneReducer(
  state: AppStepperOneState,
  action: AppStepperOneAction
): AppStepperOneState {
  switch (action.type) {
    case ActionTypes.SET_NEW_LIST_NAME:
      return {
        ...state,
        newListName: action.payload,
      }

    case ActionTypes.TOGGLE_REQUIREMENT: {
      const currentIndex = state.checkedRequirementNames.indexOf(action.payload)
      const newChecked = [...state.checkedRequirementNames]

      if (currentIndex === -1) {
        newChecked.push(action.payload)
      } else {
        newChecked.splice(currentIndex, 1)
      }
      return { ...state, checkedRequirementNames: newChecked }
    }

    case ActionTypes.TOGGLE_ALL_REQUIREMENTS: {
      const { itemsToToggle } = action.payload
      const { checkedRequirementNames } = state

      if (intersection(checkedRequirementNames, itemsToToggle).length === itemsToToggle.length) {
        return {
          ...state,
          checkedRequirementNames: not(checkedRequirementNames, itemsToToggle),
        }
      } else {
        return {
          ...state,
          checkedRequirementNames: union(checkedRequirementNames, itemsToToggle),
        }
      }
    }

    case ActionTypes.RESET_FORM: {
      return {
        ...state,
        newListName: '',
        checkedRequirementNames: [],
      }
    }

    default:
      return state
  }
}
