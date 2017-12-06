import React from 'react';
import {observer} from "mobx-react";
import {when} from "mobx";

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

    constructor (props) {
        super(props);
        this.board = boardStore.get(props.match.params.boardId);

        if (!this.board.identifier && !props.match.params.boardId) {
            when(
                () => this.board.identifier,
                () => {
                    props.history.push("/board/" + this.board.identifier)
                }
            )
        }
    }

    render() {
        return (
            <Main>
                {this.board.isLoading ? <Loading /> : <Board board={this.board} />}
            </Main>
        );
    }
})

export default BoardContainer;
