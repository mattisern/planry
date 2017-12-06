import React from 'react';
import {observer} from 'mobx-react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom'

import "./style/bootstrap.min.css";
import "./style/App.css";

import Board from "./views/boards/Board";

const App = observer(class App extends React.Component {
    render() {
        return (
            <BrowserRouter>
                <Switch>                    
                    <Route path='/board/:boardId?' component={Board}/>
                    <Route path="/" render={() => (
                        <Redirect to="/board"/>
                    )}/>
                </Switch>
            </BrowserRouter>
        );
    }
})

export default App;
