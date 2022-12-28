import { Component } from 'react';
import { Provider } from 'react-redux';
import { Switch, Route } from 'react-router';
import { ConnectedRouter } from 'connected-react-router';

import routes from '../constants/routes';
import HomePage from './HomePage';
import Splash from '../components/Splash/Splash';

class App extends Component {
  render() {
    const { store, history } = this.props;
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <Switch>
            <Route exact path={routes.SPLASH} component={Splash} />
            <Route path={routes.HOME}>
              <HomePage />
            </Route>
          </Switch>
        </ConnectedRouter>
      </Provider>
    );
  }
}
export default App;