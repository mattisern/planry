import React from 'react';
import {observer} from "mobx-react";

const Header = observer(class Header extends React.Component {
    render() {
        return (
            <div className="container text-center">
                <div className="row">
                    <div className="col-sm-12 text-center">
                        <input 
                            className="editable-header h1"
                            type="text"
                            placeholder="Your project name"
                            value={this.props.board.name}
                            onChange={(e) => this.props.board.updateTitle(e.target.value)}
                        />
                        <p className="subheader">Share the URL with your friends and start collaborating!</p>
                    </div>
                </div>
            </div>
        );
    }
})

export default Header;
