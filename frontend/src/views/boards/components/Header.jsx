import React from 'react';
import {observer} from "mobx-react";

const Header = observer(class Header extends React.Component {
    render() {
        const isDisabled = this.props.board.disabled;

        return (
            <div className="container text-center">
                <div className="row">
                    <div className="col-sm-12 text-center">
                        <input 
                            className={"editable-header h1 " + (isDisabled ? "notify-edit" : "")}
                            disabled={isDisabled}
                            type="text"
                            placeholder="Your project name"
                            value={this.props.board.name ? this.props.board.name : ""}
                            onChange={(e) => this.props.board.updateTitle(e.target.value)}
                            onFocus={(e) => this.props.board.onStartEditing("title")}
                            onBlur={(e) => this.props.board.onEndEditing("title")}
                        />
                        <p className="subheader">Share the URL with your friends and start collaborating!</p>
                    </div>
                </div>
            </div>
        );
    }
})

export default Header;
