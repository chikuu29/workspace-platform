/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string; // replace with your actual environment variables
    readonly VITE_OTHER_ENV: string;    // add more as needed
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  