export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```
5.  Click **Commit changes**.

---

### Step 2: Double Check the "Connection"
Now, let's make sure your main file is actually asking for the styles.

1.  Open `src/main.jsx` on GitHub.
2.  Look for this specific line near the top (usually line 4):
    ```javascript
    import './index.css'
    ```
3.  **If that line is missing:** Click the pencil icon and add it. The whole file should look like this:

    ```javascript
    import React from 'react'
    import ReactDOM from 'react-dom/client'
    import App from './App.jsx'
    import './index.css' // <--- THIS IS CRITICAL

    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
