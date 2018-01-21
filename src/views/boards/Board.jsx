import React from 'react';
import {observer} from "mobx-react";
import {reaction, when} from "mobx";
import {withRouter} from "react-router-dom";

import Main from "../../containers/Main";
import Loading from "../../components/Loading";

import Header from "./components/Header"
import TextWidget from "./components/TextWidget"
import ChecklistWidget from "./components/ChecklistWidget"
import WidgetAdd from "./components/WidgetAdd"

import boardStore from "../../stores/BoardStore";
import visitedStore from "../../stores/VisitedStore";

const Board = observer(class Board extends React.Component {
    componentDidMount () {
        when(
            () => this.props.board.identifier,
            () => visitedStore.save({identifier: this.props.board.identifier, name: this.props.board.name})
        );
    }

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

        const boardId = props.match.params.boardId;

        this.board = boardStore.get(boardId);
        
        if (!boardId) {
            reaction(
                () => this.board.identifier,
                () => {
                    props.history.push("/boards/" + this.board.identifier)
                }
            )
        }
    }

    render() {
        let content;
        if (this.board.isError) {
            content = <div className="error">Something went wrong while trying to fetch your project</div>;
        } else if (this.board.isLoading) {
            content = <Loading />
        } else {
            content = <Board board={this.board} />
        }

        return (
            <Main>
                {content}
            </Main>
        );
    }
})

export default withRouter(BoardContainer);
