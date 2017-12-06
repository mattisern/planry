import React from 'react';
import {observer} from 'mobx-react';
import { BrowserRouter, Route } from 'react-router-dom'

import "./style/bootstrap.min.css";
import "./style/App.css";

import Board from "./views/boards/Board";

const App = observer(class App extends React.Component {
    render() {
        return (
            <BrowserRouter>
                <Route path='/:boardId?' component={Board}/>
            </BrowserRouter>
        );
    }
})

export default App;
