import React from 'react';
import {observer} from 'mobx-react';

import "./bootstrap.min.css";
import "./App.css";

import Board from "./views/boards/Board";

const App = observer(class App extends React.Component {
    render() {
        return (
            <div className="App">
                <Board />
            </div>
        );
    }
})

export default App;
