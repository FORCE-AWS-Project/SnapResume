import Handlebars from 'handlebars'

class TemplateRenderer {
  static async renderTemplate(templateUrl, data) {
    try {
      // Fetch the template HTML
      const templateHtml = await this.fetchTemplate(templateUrl)

      // Compile the template
      const template = Handlebars.compile(templateHtml)
      console.log("Template data: ",data)
      // Render with data
      return template(data)
    } catch (error) {
      console.error('Error rendering template:', error)
      throw new Error('Failed to render template: ' + error.message)
    }
  }

  static async fetchTemplate(templateUrl) {
    // Add cache-busting parameter
    const url = new URL(templateUrl, window.location.origin)
    url.searchParams.set('v', Date.now())

    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(`Failed to fetch template: ${response.statusText}`)
    }
    return await response.text()
  }

  static registerHelpers() {
    // Register custom Handlebars helpers if needed
    Handlebars.registerHelper('formatDate', (date) => {
      if (!date) return ''
      const d = new Date(date)
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    })

    Handlebars.registerHelper('join', (array, separator = ', ') => {
      if (!Array.isArray(array)) return ''
      return array.join(separator)
    })

    Handlebars.registerHelper('toLowerCase', (str) => {
      return str ? str.toString().toLowerCase() : ''
    })
  }
}

// Initialize helpers when module loads
TemplateRenderer.registerHelpers()

export { TemplateRenderer }