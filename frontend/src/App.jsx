import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Generos from './pages/Generos';
import Directores from './pages/Directores';
import Productoras from './pages/Productoras';
import Tipos from './pages/Tipos';

function App() {
  return (
      <Router>
        <Switch>
          <Route exact path="/" render={() => <MainLayout><Generos /></MainLayout>} />
          <Route path="/generos" render={() => <MainLayout><Generos /></MainLayout>} />
          <Route path="/directores" render={() => <MainLayout><Directores /></MainLayout>} />
          <Route path="/productoras" render={() => <MainLayout><Productoras /></MainLayout>} />
          <Route path="/tipos" render={() => <MainLayout><Tipos /></MainLayout>} />
        </Switch>
      </Router>
  );
}

export default App;