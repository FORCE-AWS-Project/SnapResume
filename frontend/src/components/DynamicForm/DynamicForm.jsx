import { withTheme } from '@rjsf/core'
import { Theme as AntDTheme } from '@rjsf/antd'
import validator from '@rjsf/validator-ajv8'
import ArrayFieldTemplate from '../ArrayFieldTemplate/ArrayFieldTemplate'

const RJSFForm = withTheme(AntDTheme)

export default function DynamicForm({ schema, uiSchema, formData, onChange, onError }) {

  const handleChange = ({ formData }) => {
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
      formData={formData}
      onChange={handleChange}
      onError={handleError}
      validator={validator}
      liveValidate={false}
      showErrorList={false}
      noHtml5Validate={true}
      templates={{
        ArrayFieldTemplate: ArrayFieldTemplate,
      }}
    />
  )
}