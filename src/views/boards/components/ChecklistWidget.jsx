import React from 'react';

import {reaction} from "mobx";
import {observer} from "mobx-react";

import Editor, {createEditorStateWithText} from 'draft-js-plugins-editor';
import {getDefaultKeyBinding} from 'draft-js';

import WidgetDelete from "./WidgetDelete";
import WidgetHeader from "./WidgetHeader";

const Task = observer(class Task extends React.Component {
    constructor (props) {
        super(props);

        console.log(props.task)
        this.state = { 
            editorState: createEditorStateWithText(props.task.description || "")
        };
    }

    keyBindings = (e) => {
        if (e.key.toLowerCase() === "enter") {
          return 'enter';
        }
        
        return getDefaultKeyBinding(e);
    }

    handleKeyCommand = (command) => {
        switch (command) {
            case "enter":
                this.props.widget.addTask();
                return 'handled';
            default:
                return 'not-handled';
        }
    }

    componentDidMount () {
        if (this.props.widget.didAdd) {
            this.input.focus();
            this.props.widget.didAdd = false;
        }

        this.dispose = reaction(
            () => this.props.task.description,
            (text) => {
                if (this.props.widget.isDisabled("description")) {
                    this.setState({
                        editorState: createEditorStateWithText(this.props.task.description || "")
                    })
                }
            }
        )
    }

    componentWillUnmount () {
        this.dispose();
    }

    render () {
        const isDisabled = this.props.task.disabled;

        return (
            <li className="list-group-item d-flex justify-content-between align-items-center">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={this.props.task.completed}
                        onChange={(e) => this.props.task.update("completed", e.target.checked)}
                    />
                    <span className="checkbox" /> {/* HIDE THE CHECKBOX AND STYLE THE SPAN TO LOOK LIKE A CHECKBOX. input + span {} AND input:checked + span {} */}
                </label>
                <div className={"editable-label " + (isDisabled ? "notify-edit" : "")}>
                    <Editor 
                        ref={(i) => this.input = i}
                        editorState={this.state.editorState} 
                        onChange={(editorState) => {
                            this.setState({editorState});
                            const text = editorState.getCurrentContent().getPlainText();

                            this.props.task.update("description", text);
                        }}
                        placeholder="New task"
                        readOnly={isDisabled}               
                        onFocus={() => this.props.task.onStartEditing("description")}
                        onBlur={() => this.props.task.onEndEditing("description")}
                        handleKeyCommand={this.handleKeyCommand}
                        keyBindingFn={this.keyBindings}
                    />
                </div>
                <span className="clickable delete-task" onClick={() => this.props.task.delete()}>x</span>
            </li>
        )
    }
})

const Tasks = observer(class Tasks extends React.Component {
    render () {
        return (
            <ul id="tasks" className="list-group widget-content">
                {
                    this.props.widget.tasks.map((task) => {
                        return <Task key={task.id} widget={this.props.widget} task={task} />
                    })
                }
            </ul>
        )
    }
})

const ChecklistWidget = observer(class ChecklistWidget extends React.Component {
    render() {
        return (
            <div className="widget checklist-widget">
                <WidgetDelete widget={this.props.widget} />
                <WidgetHeader widget={this.props.widget} />
                <Tasks widget={this.props.widget} />
                <div className="centered-content">
                    <a className="btn btn-secondary add-task" role="button" onClick={() => this.props.widget.addTask()}>
                        +<br/>
                    </a>
                </div>
            </div>
        );
    }
})

export default ChecklistWidget;
