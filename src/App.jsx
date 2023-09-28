import React,{ useState } from 'react';
import "./App.css"

function App() {

  const [startTime,setStartTime] = useState('10:10');

  return (
    <div>
      Hello asdasd {startTime}
    </div>
  );
}

export default App;
