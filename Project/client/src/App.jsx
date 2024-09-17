import { useState } from "react";
import "./App.css";
import Image from "./components/Image";
import PropComponent from "./components/PropComponent";

function App() {
  const [count, setCount] = useState(0);

  let content;
  if(count==0){
    content=<p>Count is 0</p>
  }
  else
  {
    content=<p>Count has update</p>
  }

  return (
    <>
    {content}
      <Image></Image>
      <h1>Vite + React</h1>

      <PropComponent
        title="Web Programming"
        description="Discussing Component with prop in today's class"
      ><p>Demonstration of children prop</p>
      <p>test children</p></PropComponent>


{/* <PropComponent
        title="test"
        description="Discussing Component with prop in today's class"
      >
        
      </PropComponent>

<PropComponent
        title="test2"
        description="Discussing Component with prop in today's class"
      ></PropComponent> */}

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
