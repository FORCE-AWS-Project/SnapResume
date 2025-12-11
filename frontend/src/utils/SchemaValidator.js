class SchemaValidator {
  static validate(data, schema) {
    const errors = [];

    for (const [sectionName, sectionDef] of Object.entries(schema)) {
      const sectionData = data[sectionName];

      if (sectionDef.required && !sectionData) {
        errors.push(`${sectionName} is required`);
        continue;
      }

      if (!sectionData) continue;

      if (sectionDef.type === 'object') {
        this.validateObject(sectionData, sectionDef.fields, sectionName, errors);
      }
      else if (sectionDef.type === 'array') {
        if (!Array.isArray(sectionData)) {
          errors.push(`${sectionName} must be an array`);
          continue;
        }

        if (sectionDef.minItems && sectionData.length < sectionDef.minItems) {
          errors.push(`${sectionName} must have at least ${sectionDef.minItems} items`);
        }

        if (sectionDef.maxItems && sectionData.length > sectionDef.maxItems) {
          errors.push(`${sectionName} must have at most ${sectionDef.maxItems} items`);
        }

        sectionData.forEach((item, index) => {
          this.validateObject(item, sectionDef.itemSchema, `${sectionName}[${index}]`, errors);
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateObject(data, fields, path, errors) {
    for (const [fieldName, fieldDef] of Object.entries(fields)) {
      const fieldValue = data[fieldName];
      const fieldPath = `${path}.${fieldName}`;

      if (fieldDef.required && !fieldValue) {
        errors.push(`${fieldPath} is required`);
        continue;
      }

      if (!fieldValue) continue;

      switch (fieldDef.type) {
        case 'string':
        case 'text':
          if (typeof fieldValue !== 'string') {
            errors.push(`${fieldPath} must be a string`);
          }
          break;

        case 'link':
          if (typeof fieldValue !== 'string') {
            errors.push(`${fieldPath} must be a string`);
          } else if (!this.isValidUrl(fieldValue)) {
            errors.push(`${fieldPath} must be a valid URL`);
          }
          break;

        case 'date':
          if (!this.isValidDate(fieldValue)) {
            errors.push(`${fieldPath} must be a valid date (YYYY-MM-DD or YYYY-MM)`);
          }
          break;

        case 'number':
          if (typeof fieldValue !== 'number') {
            errors.push(`${fieldPath} must be a number`);
          }
          break;

        case 'boolean':
          if (typeof fieldValue !== 'boolean') {
            errors.push(`${fieldPath} must be a boolean`);
          }
          break;

        case 'array':
          if (!Array.isArray(fieldValue)) {
            errors.push(`${fieldPath} must be an array`);
          } else if (fieldDef.items?.type === 'string') {
            fieldValue.forEach((item, idx) => {
              if (typeof item !== 'string') {
                errors.push(`${fieldPath}[${idx}] must be a string`);
              }
            });
          }
          break;

        case 'object':
          if (typeof fieldValue !== 'object' || Array.isArray(fieldValue)) {
            errors.push(`${fieldPath} must be an object`);
          }
          break;
      }
    }
  }

  static isValidUrl(url) {
    try {
      const urlToTest = url.startsWith('http') ? url : `https://${url}`;
      new URL(urlToTest);
      return true;
    } catch {
      return false;
    }
  }

  static isValidDate(date) {
    return /^\d{4}-\d{2}(-\d{2})?$/.test(date);
  }
}

export { SchemaValidator };