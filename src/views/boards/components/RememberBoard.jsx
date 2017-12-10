import React from 'react';
import {observer} from "mobx-react";
import boardStore from "../../../stores/BoardStore";

const RememberBoard = observer(class RememberBoard extends React.Component {
    handleClick () {
        window.localStorage.setItem("rememberedBoardIdentifier", boardStore.identifier);

        alert("The board will now be remembered on this computer")
    }

    render() {
        return <button className="clickable btn btn-link" type="button" onClick={this.handleClick}>Remember board</button>;
    }
})

export default RememberBoard;
