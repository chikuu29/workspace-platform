const loadScripts = (scriptFiles: string[]) => {
  console.log("Calling LoadScript",scriptFiles); // ['Gym/addMemberScript']
  
  
  return Promise.all(
    scriptFiles.map((file) => {
      return import(/* @vite-ignore */`\../../script/${file}.ts`); // Adjust the import path as needed
    })
  );
};

export default loadScripts;
