// // Tawk.to Live Chat Loader
// // Dynamically loads Tawk.to widget based on admin settings

// class TawktoLoader {
//   constructor() {
//     this.loaded = false;
//   }

//   async init() {
//     try {
//       // Fetch settings to check if Tawk.to is enabled
//       const response = await fetch(`${window.API ? window.API_BASE_URL || 'http://172.20.10.3:5000/api' : 'http://172.20.10.3:5000/api'}/settings`);
//       const data = await response.json();
      
//       if (data.settings && data.settings.tawkEnabled && data.settings.tawkScript) {
//         this.loadTawkto(data.settings.tawkScript);
//       }
//     } catch (error) {
//       console.log('Tawk.to not loaded:', error.message);
//     }
//   }

//   loadTawkto(scriptContent) {
//     if (this.loaded) return;
    
//     // Create a temporary container to parse the script
//     const tempDiv = document.createElement('div');
//     tempDiv.innerHTML = scriptContent;
    
//     // Extract and execute scripts
//     const scripts = tempDiv.querySelectorAll('script');
//     scripts.forEach(script => {
//       const newScript = document.createElement('script');
      
//       // Copy attributes
//       Array.from(script.attributes).forEach(attr => {
//         newScript.setAttribute(attr.name, attr.value);
//       });
      
//       // Copy content
//       newScript.textContent = script.textContent;
      
//       // Append to document
//       document.body.appendChild(newScript);
//     });
    
//     this.loaded = true;
//     console.log('Tawk.to loaded successfully');
//   }
// }

// // Initialize when DOM is ready
// document.addEventListener('DOMContentLoaded', () => {
//   const loader = new TawktoLoader();
//   loader.init();
// });

(function() {
    // 1. Pull user data from localStorage immediately
    const userRaw = localStorage.getItem('user');
    let userData = null;

    try {
        if (userRaw) {
            userData = JSON.parse(userRaw);
            console.log("Tawk Loader: User data found:", userData);
        }
    } catch (e) {
        console.error("Tawk Loader: Error parsing user data", e);
    }

    // 2. Setup the Tawk_API and set identity BEFORE the script loads
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    window.Tawk_API.onLoad = function() {
        if (userData) {
            const name = userData.fullName || userData.name || "User";
            const email = userData.email || "";

            window.Tawk_API.setAttributes({
                'name': name,
                'email': email
            }, function(error) {
                if (error) console.log("Tawk Error:", error);
                else console.log("Tawk Success: Identity set for " + name);
            });
        }
    };

    // 3. Manually load the script (Fastest and most reliable)
    // Replace 'YOUR_PROPERTY_ID' and 'default' with your actual IDs from the Tawk dashboard
    var s1 = document.createElement("script"),
        s0 = document.getElementsByTagName("script")[0];
    s1.async = true;
    s1.src = 'https://embed.tawk.to/69c317cf6b8b821c3ef15678/default'; 
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    s0.parentNode.insertBefore(s1, s0);
})();
