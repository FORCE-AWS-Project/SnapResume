import { useState } from 'react'
import { withTheme } from '@rjsf/core'
import { Theme as AntDTheme } from '@rjsf/antd'
import validator from '@rjsf/validator-ajv8'
import ArrayFieldTemplate from '../ArrayFieldTemplate/ArrayFieldTemplate'

const RJSFForm = withTheme(AntDTheme)

export default function DynamicForm({ schema, uiSchema, formData, onChange, onSubmit, onError }) {
  const [localFormData, setLocalFormData] = useState(formData || {})

  const handleChange = ({ formData }) => {
    setLocalFormData(formData)

    if (onChange) {
      onChange(formData)
    }
  }

  const handleSubmit = ({ formData }) => {
    if (onSubmit) {
      onSubmit(formData)
    }
  }

  const handleError = (errors) => {
    if (onError) {
      onError(errors)
    }
  }

  return (
    <RJSFForm
      schema={schema}
      uiSchema={uiSchema}
      formData={localFormData}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onError={handleError}
      validator={validator}
      liveValidate={false}
      showErrorList={false}
      templates={{
        ArrayFieldTemplate: ArrayFieldTemplate,
      }}
    />
  )
}