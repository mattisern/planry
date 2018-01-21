import React from 'react';
import {observer} from 'mobx-react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom'

import "./style/bootstrap.min.css";
import "./style/App.css";

import Board from "./views/boards/Board";
import Start from "./views/start/Start";

const App = observer(class App extends React.Component {
    render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route path='/boards/:boardId?' component={Board}/>
                    <Route path="/" component={Start} />
                </Switch>
            </BrowserRouter>
        );
    }
})

export default App;
