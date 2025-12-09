import React, { createContext, useContext, useReducer, useCallback } from 'react'

// Action types
const SET_TEMPLATE = 'SET_TEMPLATE'
const SET_RESUME_DATA = 'SET_RESUME_DATA'
const SET_SECTION_DATA = 'SET_SECTION_DATA'
const ADD_SECTION_ITEM = 'ADD_SECTION_ITEM'
const UPDATE_SECTION_ITEM = 'UPDATE_SECTION_ITEM'
const DELETE_SECTION_ITEM = 'DELETE_SECTION_ITEM'
const TOGGLE_SECTION = 'TOGGLE_SECTION'
const SET_LOADING = 'SET_LOADING'
const SET_SAVING = 'SET_SAVING'
const SET_SELECTED_SECTION = 'SET_SELECTED_SECTION'

// Initial state
const initialState = {
  template: null,
  resumeData: {},
  sectionStates: {},
  selectedSection: null,
  loading: false,
  saving: false,
}

// Reducer
const resumeReducer = (state, action) => {
  switch (action.type) {
    case SET_TEMPLATE:
      return {
        ...state,
        template: action.payload,
        loading: false,
      }

    case SET_RESUME_DATA:
      return {
        ...state,
        resumeData: action.payload,
      }

    case SET_SECTION_DATA:
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          [action.sectionType]: action.data,
        },
      }

    case ADD_SECTION_ITEM:
      const { sectionType, item } = action.payload
      const currentItems = state.resumeData[sectionType] || []

      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          [sectionType]: [...currentItems, item],
        },
        sectionStates: {
          ...state.sectionStates,
          [sectionType]: {
            ...state.sectionStates[sectionType],
            expanded: true,
          },
        },
        selectedSection: { type: sectionType, action: 'edit', itemId: item.tempId },
      }

    case UPDATE_SECTION_ITEM:
      const { sectionType: updateSectionType, itemId, field, value } = action.payload
      const updateItems = state.resumeData[updateSectionType] || []
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          [updateSectionType]: updateItems.map(item => {
            if (item.tempId === itemId || item.sectionId === itemId) {
              return { ...item, [field]: value }
            }
            return item
          }),
        },
      }

    case DELETE_SECTION_ITEM:
      const { sectionType: deleteSectionType, itemId: deleteItemId } = action.payload
      const deleteItems = state.resumeData[deleteSectionType] || []
      const filteredItems = deleteItems.filter(item =>
        item.tempId !== deleteItemId && item.sectionId !== deleteItemId
      )
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          [deleteSectionType]: filteredItems,
        },
        // If we deleted the last item and are currently editing it, deselect
        selectedSection: state.selectedSection?.itemId === deleteItemId ? null : state.selectedSection,
      }

    case TOGGLE_SECTION:
      const { sectionType: toggleSectionType, expanded } = action.payload
      return {
        ...state,
        sectionStates: {
          ...state.sectionStates,
          [toggleSectionType]: {
            ...state.sectionStates[toggleSectionType],
            expanded,
          },
        },
        // If collapsing current section, deselect it
        selectedSection: !expanded && state.selectedSection?.type === toggleSectionType ? null : state.selectedSection,
      }

    case SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      }

    case SET_SAVING:
      return {
        ...state,
        saving: action.payload,
      }

    case SET_SELECTED_SECTION:
      return {
        ...state,
        selectedSection: action.payload,
      }

    default:
      return state
  }
}

// Context
const ResumeContext = createContext()

// Provider component
export const ResumeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(resumeReducer, initialState)

  // Actions
  const setTemplate = useCallback((template) => {
    dispatch({ type: SET_TEMPLATE, payload: template })
    // Initialize section states and resume data
    const sectionStates = {}
    const resumeData = {}

    let inputDataSchema
    if (template?.inputDataSchema) {
      if (typeof template.inputDataSchema === 'string') {
        try {
          inputDataSchema = JSON.parse(template.inputDataSchema)
        } catch (error) {
          console.error('Failed to parse inputDataSchema:', error)
          inputDataSchema = null
        }
      } else {
        inputDataSchema = template.inputDataSchema
      }
    }

    if (inputDataSchema) {
      Object.entries(inputDataSchema).forEach(([sectionType, schema]) => {
        sectionStates[sectionType] = {
          expanded: false,
          isArray: schema.type === 'array',
          required: schema.required || false,
          schema: schema,
        }
        // Initialize empty data for each section
        if (schema.type === 'array') {
          resumeData[sectionType] = []
        } else {
          resumeData[sectionType] = null
        }
      })
    }

    // Update the template object with parsed schema for future use
    const updatedTemplate = { ...template, inputDataSchema }
    dispatch({ type: SET_TEMPLATE, payload: updatedTemplate })
    dispatch({ type: 'SET_SECTION_STATES', payload: sectionStates })
    dispatch({ type: SET_RESUME_DATA, payload: resumeData })
  }, [])

  const setResumeData = useCallback((data) => {
    dispatch({ type: SET_RESUME_DATA, payload: data })
  }, [])

  const setSectionData = useCallback((sectionType, data) => {
    dispatch({ type: SET_SECTION_DATA, sectionType, data })
  }, [])

  const addSectionItem = useCallback((sectionType, item) => {
    console.log("Current state: ",state)
    dispatch({ type: ADD_SECTION_ITEM, payload: { sectionType, item } })
  }, [])

  const updateSectionItem = useCallback((sectionType, itemId, field, value) => {
    dispatch({ type: UPDATE_SECTION_ITEM, payload: { sectionType, itemId, field, value } })
  }, [])

  const deleteSectionItem = useCallback((sectionType, itemId) => {
    dispatch({ type: DELETE_SECTION_ITEM, payload: { sectionType, itemId } })
  }, [])

  const toggleSection = useCallback((sectionType, expanded) => {
    dispatch({ type: TOGGLE_SECTION, payload: { sectionType, expanded } })
  }, [])

  const selectSection = useCallback((sectionType, action = 'view', itemId = null) => {
    dispatch({ type: 'SET_SELECTED_SECTION', payload: { type: sectionType, action, itemId } })
  }, [])

  const setLoading = useCallback((loading) => {
    dispatch({ type: SET_LOADING, payload: loading })
  }, [])

  const setSaving = useCallback((saving) => {
    dispatch({ type: SET_SAVING, payload: saving })
  }, [])

  const value = {
    ...state,
    setTemplate,
    setResumeData,
    setSectionData,
    addSectionItem,
    updateSectionItem,
    deleteSectionItem,
    toggleSection,
    selectSection,
    setLoading,
    setSaving,
  }

  return <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>
}

// Hook to use the context
export const useResume = () => {
  const context = useContext(ResumeContext)
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider')
  }
  return context
}

// Helper function to extract default values from schema
export const getDefaultValue = (fieldDefinition) => {
  switch (fieldDefinition.type) {
    case 'string':
    case 'text':
    case 'link':
    case 'date':
      return ''
    case 'number':
      return 0
    case 'boolean':
      return false
    case 'array':
      return []
    case 'object':
      const defaults = {}
      if (fieldDefinition.fields) {
        Object.entries(fieldDefinition.fields).forEach(([key, field]) => {
          defaults[key] = getDefaultValue(field)
        })
      }
      return defaults
    default:
      return ''
  }
}

// Helper to create empty section item from schema
export const createEmptySectionItem = (sectionSchema) => {
  const item = {}
  Object.entries(sectionSchema.itemSchema || sectionSchema.fields || {}).forEach(([key, field]) => {
    item[key] = getDefaultValue(field)
  })
  return item
}