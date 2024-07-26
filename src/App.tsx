import { useEffect } from 'react';

function App() {
  useEffect(() => {
    document.documentElement.classList.add('default-theme');
  }, []);

  return <></>;
}

export default App;
