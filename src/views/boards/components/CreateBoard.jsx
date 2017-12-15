import React from 'react';
import {observer} from "mobx-react";
import boardStore from "../../../stores/BoardStore";

const CreateBoard = observer(class CreateBoard extends React.Component {
    handleClick = () => {
        boardStore.create();
    }

    render() {
        return <button className="clickable btn btn-link" type="button" onClick={this.handleClick}>+ New project</button>;
    }
})

export default CreateBoard;
