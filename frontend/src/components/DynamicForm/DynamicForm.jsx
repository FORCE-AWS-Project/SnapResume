import { useState } from 'react'
import { withTheme } from '@rjsf/core'
import { Theme as AntDTheme } from '@rjsf/antd'
import validator from '@rjsf/validator-ajv8'
import ArrayFieldTemplate from '../ArrayFieldTemplate/ArrayFieldTemplate'

const RJSFForm = withTheme(AntDTheme)

export default function DynamicForm({ schema, uiSchema, formData, onChange, onError }) {
  const [localFormData, setLocalFormData] = useState(formData || {})
  console.log("Form data: ",formData);
  console.log("Schema inside dynamic form: ",schema)
  const handleChange = ({ formData }) => {
    setLocalFormData(formData)

    if (onChange) {
      onChange(formData)
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