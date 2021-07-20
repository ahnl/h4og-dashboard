import {
  BrowserRouter as Router,
  Switch,
  Route,
  useLocation,
  useParams,
  useHistory
} from "react-router-dom";

import './styles/App.css';
import { SelectButton } from './components/input';
import postcards02Light from './assets/images/postcards_02_light.jpg';

import { displayTypes, typeComponents } from './displayTypes.js';
import { useEffect, useState } from "react";

function Filters({queryParams, setQueryParams}) {  
  let {pathname} = useLocation();
  let displayType = pathname.slice(1) || '';

  useEffect(() => {
    const newQueryParams = {};
    if (displayType !== '') newQueryParams.type = displayType;

    if (JSON.stringify(queryParams) === JSON.stringify(newQueryParams)) return;
    setQueryParams(newQueryParams)
  }, [displayType, queryParams, setQueryParams]);

  return (
    <div className="container" style={{backgroundImage: "url('" + postcards02Light + "')"}}>
      <span>Display types</span>
      <div className="inputGroup selectGroup">
        {Object.keys(displayTypes).map((name) => (
          <SelectButton value={displayTypes[name]} selected={displayType === displayTypes[name]}>{name}</SelectButton>
        ))}
      </div>
    </div>
  )
}

function Results({data}) {
  //let {pathname} = useLocation();
  //let displayType = pathname.slice(1);
  //    Filter: {Object.keys(displayTypes).find(key => displayTypes[key] === displayType)}

  return (
    <div className="container resultGrid">
      {data.map(item => {
        if (typeComponents[item.type] === undefined) {
          console.log(`Couldn't find component for type ${item.type}`);
          return <></>;
        }
        return typeComponents[item.type].card({
          data: item
        });
      })}
    </div>
  ) 
}

function SinglePage({data}) {
  const { slug } = useParams();
  const location = useLocation();
  const type = location.pathname.split('/')[1];
  
  try {
    const card = data.find(p => p.type === type && p.slug === slug);
    console.log(card)
    return typeComponents[card.type].page({
      data: card
    });
  } catch (e) {
    return <></>;
  }
}

function Header(props) {
  const history = useHistory();

  return (
    <div className="header">
      <h1>Hack4OpenGLAM Dashboard</h1>
      {props.backButton ?
        <div>
          <button onClick={() => history.goBack()}>&lt; {props.backButton}</button>
        </div>
      :
        <div>
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSc-ANlrZl9HDIYOP8d2MRzFK7v6WOuzNOpYxy2Roy-pgX3BOg/viewform">
              <button>Event Registration</button>
            </a>
        </div>
      }
    </div>
  )
}
function App() {

  const [data, setData] = useState([]);
  
  const baseResultsUrl = (process.env.NODE_ENV === 'development' ? 'http://localhost:80/api/results' : '/api/results');
  const [queryParams, setQueryParams] = useState({initial: true});

  useEffect(() => {
    if (queryParams.initial === true) return;
    
    const resultsUrl = `${baseResultsUrl}?${Object.keys(queryParams).map(key => key + '=' + queryParams[key]).join('&')}`;

    console.log(resultsUrl)
    fetch(resultsUrl)
    .then(res => res.json())
    .then((json) => {
      console.log(json)
      setData(json);
    })
  }, [queryParams, baseResultsUrl])

  console.log(Object.values(displayTypes).map(val => `/${val}`))
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route exact path={[...(Object.values(displayTypes).map(val => `/${val}`))]}>
            <Header />
            <Filters queryParams={queryParams} setQueryParams={setQueryParams} />
            <Results data={data} />
          </Route>
          <Route exact path={[...(Object.values(displayTypes).map(val => `/${val}/:slug`))]}>
            <Header backButton="Back to Results"/>
            <SinglePage data={data} />
          </Route>
        </Switch>
      </div>
    </Router>    
  );
}

export default App;
