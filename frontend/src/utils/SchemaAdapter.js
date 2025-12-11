const typeConverter =(type)=> {
  switch (type) {
    case "text": 
      return "string"
    case "date":
      return "string"
    case "link":
      return "uri"
    default:
      return type
  }
}

class SchemaAdapter {
  /**
   * Convert backend schema to RJSF format
   * @param {Object} schema - The backend schema object or itemSchema
   * @returns {Object} RJSF compatible schema
   */
  static toRJSF(schema) {
    const rjsfSchema = {
      type: 'object',
      properties: {},
      required: []
    }

    for (const [fieldName, fieldDef] of Object.entries(schema)) {
      if (typeof fieldDef === 'object' && fieldDef !== null && !Array.isArray(fieldDef)) {
        // Skip sectionId fields as they're internal
        if (fieldName === 'sectionId') {
          continue
        }

        // Regular field definition
        rjsfSchema.properties[fieldName] = {
          title: fieldDef.title || fieldName,
          type: typeConverter(fieldDef.type),
        }

        // Add format for special types
        if (fieldDef.type === 'link') {
          rjsfSchema.properties[fieldName].format = 'uri'
        } else if (fieldDef.type === 'date') {
          rjsfSchema.properties[fieldName].format = 'date'
        } else if (fieldDef.type === 'text') {
          rjsfSchema.properties[fieldName].type = 'string'
          rjsfSchema.properties[fieldName].widget = 'textarea'
        } else if (fieldDef.type === 'array' && fieldDef.items?.type) {
          // Array of primitive types
          rjsfSchema.properties[fieldName].type = 'array'
          rjsfSchema.properties[fieldName].items = {
            type: fieldDef.items.type
          }
        } else if (fieldDef.type === 'array' && !fieldDef.items) {
          // Array without items type - default to string array
          rjsfSchema.properties[fieldName].type = 'array'
          rjsfSchema.properties[fieldName].items = {
            type: 'string'
          }
        }

        // Check if field is required
        if (fieldDef.tags?.includes('required') || fieldDef.required) {
          rjsfSchema.required.push(fieldName)
        }
      }
    }

    return rjsfSchema
  }

  /**
   * Generate UI schema for RJSF to customize widgets
   * @param {Object} schema - The backend schema
   * @returns {Object} UI schema
   */
  static getUiSchema(schema) {
    const uiSchema = {}

    for (const [fieldName, fieldDef] of Object.entries(schema)) {
      if (typeof fieldDef === 'object' && fieldDef !== null && !Array.isArray(fieldDef)) {
        // Skip sectionId fields as they're internal
        if (fieldName === 'sectionId') {
          continue
        }

        uiSchema[fieldName] = {}

        // Set widgets for different types
        if (fieldDef.type === 'text' || (fieldDef.type === 'string' && fieldDef.title?.toLowerCase().includes('description'))) {
          uiSchema[fieldName] = {
            'ui:widget': 'textarea'
          }
        } else if (fieldDef.type === 'date') {
          uiSchema[fieldName] = {
            'ui:widget': 'date'
          }
        } else if (fieldDef.type === 'link') {
          uiSchema[fieldName] = {
            'ui:widget': 'url'
          }
        } else if (fieldDef.type === 'boolean') {
          uiSchema[fieldName] = {
            'ui:widget': 'checkbox'
          }
        } else if (fieldDef.type === 'array') {
          // Array field handling
          uiSchema[fieldName] = {
            'ui:options': {
              orderable: false,
              removable: true,
              addable: true
            }
          }
        }
      }
    }

    return uiSchema
  }
}

export { SchemaAdapter }