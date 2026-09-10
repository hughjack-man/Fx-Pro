// Tawk.to Live Chat Loader
// Dynamically loads Tawk.to widget based on admin settings

class TawktoLoader {
  constructor() {
    this.loaded = false;
  }

  async init() {
    try {
      // Fetch settings to check if Tawk.to is enabled
      const response = await fetch(`${window.API ? window.API_BASE_URL || 'http://172.20.10.3:5000/api' : 'http://172.20.10.3:5000/api'}/settings`);
      const data = await response.json();
      
      if (data.settings && data.settings.tawkEnabled && data.settings.tawkScript) {
        this.loadTawkto(data.settings.tawkScript);
      }
    } catch (error) {
      console.log('Tawk.to not loaded:', error.message);
    }
  }

  loadTawkto(scriptContent) {
    if (this.loaded) return;
    
    // Create a temporary container to parse the script
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = scriptContent;
    
    // Extract and execute scripts
    const scripts = tempDiv.querySelectorAll('script');
    scripts.forEach(script => {
      const newScript = document.createElement('script');
      
      // Copy attributes
      Array.from(script.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      
      // Copy content
      newScript.textContent = script.textContent;
      
      // Append to document
      document.body.appendChild(newScript);
    });
    
    this.loaded = true;
    console.log('Tawk.to loaded successfully');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const loader = new TawktoLoader();
  loader.init();
});
