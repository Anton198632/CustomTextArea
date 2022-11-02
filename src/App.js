import logo from './logo.svg';
import './App.css';
import CustomTextArea from './components/custom-text-area/custom-text-area';

function App() {


  const regexPatterns = { patterns: [
    {pattern: new RegExp('23.456'), color: 'red', id: 0},
    {pattern: /name/, color: 'yellow', id: 1},
    {pattern: /\d{1,}/, color: 'lightgreen', id: 2},
    
  ]};




  return (
    <div className="App">
      <div style={{margin: 30}}>
        <CustomTextArea id={1} regexPatterns={regexPatterns} />
        <CustomTextArea id={2} regexPatterns={regexPatterns} style={{marginTop: '20px', height: '500px', paddingTop: '20px'}}   />
      </div>
      
    </div>
  );
}

export default App;
