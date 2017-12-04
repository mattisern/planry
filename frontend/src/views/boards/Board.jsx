import React from 'react';
import {observer} from "mobx-react";

import Main from "../../containers/Main";
import Loading from "../../components/Loading";

import Header from "./components/Header"
import TextWidget from "./components/TextWidget"
import ChecklistWidget from "./components/ChecklistWidget"
import WidgetAdd from "./components/WidgetAdd"

import boardStore from "../../stores/BoardStore";

const Board = observer(class Board extends React.Component {
    render () {
        return (
            <div>
                <Header board={this.props.board} />
                <div className="widgets-container">
                    {this.props.board.widgets.map((widget) => {
                        switch (widget.kind) {
                            case "text":
                                return <TextWidget key={widget.id} widget={widget} />;
                            case "checklist":
                                return <ChecklistWidget key={widget.id} widget={widget} />;
                            default:
                                return null;
                        }
                    })}
                    <WidgetAdd board={this.props.board} />
                </div>
            </div>
        ) 
    }
});

const BoardContainer = observer(class BoardContainer extends React.Component {
    board = boardStore.get("5dd19e91-5e2e-482e-96ea-eda45edcff01")

    render() {
        return (
            <Main>
                {this.board.isLoading ? <Loading /> : <Board board={this.board} />}
            </Main>
        );
    }
})

export default BoardContainer;
