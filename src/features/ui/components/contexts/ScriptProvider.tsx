import React, { createContext, useContext, useEffect, useState } from "react";
import loadScripts from "../../../utils/app/loadScript";
import Loader from "../Loader/Loader";
// Define the shape of your context
interface DynamicImportContextType {
  getScriptInstance:any[];
  scriptFiles:string []
  // scriptInstance: (scriptFiles: string[]) => Promise<any[]>;
}

// Create ScriptContext
const ScriptContext = createContext<DynamicImportContextType | undefined>(
  undefined
);

export const ScriptProvider: React.FC<{
  children: React.ReactNode;
  scriptFiles: string[];
}> = ({ children, scriptFiles }) => {
  console.log("Script Provider", scriptFiles);
  const [scriptInstance,setScriptInstance]=useState<any>(null)
  const [loading,setLoading]=useState(true)
  useEffect(() => {
    (async () => {
      console.log("Loading Script Instance");
      try {
        const loadedScripts = await loadScripts(scriptFiles);
        setScriptInstance(loadedScripts)
        setLoading(false)
      } catch (error) {
        setLoading(false)
        console.error("%c Error loading scripts:", "color:red", error);
      }
    })();
  }, [scriptFiles]);
  if (loading) {

    return (
      <Loader loaderText="Just a moment , we're getting things ready for you..."/>
    ); // Or a loading spinner
  }
  return (
    <ScriptContext.Provider value={{ getScriptInstance:scriptInstance,scriptFiles:scriptFiles }}>
      {!loading && children}
    </ScriptContext.Provider>
  );
};

// Custom hook to use the context
export const useScriptInstance = () => {
  const context = useContext(ScriptContext);
  if (!context) {
    throw new Error("scriptInstance must be used within a ScriptProvider");
  }
  return context;
};
