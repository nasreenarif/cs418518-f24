import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

if(window.self !==window.top){
    throw new Error("There is an error in application!");    
}

createRoot(document.getElementById('root')).render(
 
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
