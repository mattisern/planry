import React from 'react';

import {reaction, observable} from "mobx";
import {observer} from "mobx-react";

import Editor, {createEditorStateWithText} from 'draft-js-plugins-editor';
import {getDefaultKeyBinding} from 'draft-js';
import {SortableContainer, SortableElement, SortableHandle, arrayMove} from 'react-sortable-hoc';

import WidgetDelete from "./WidgetDelete";
import WidgetHeader from "./WidgetHeader";

const DragHandle = SortableHandle(() => <span className="drag-handle">::</span>)

const Task = SortableElement(observer(class Task extends React.Component {
    constructor (props) {
        super(props);

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
                <DragHandle />
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
                        onBlur={() => {
                            const text = this.state.editorState.getCurrentContent().getPlainText();
                            if (!text) {
                              this.props.task.delete();
                            } else {
                              this.props.task.onEndEditing("description")
                            }
                          }
                        }
                        handleKeyCommand={this.handleKeyCommand}
                        keyBindingFn={this.keyBindings}
                    />
                </div>
                <span className="clickable delete-task" onClick={() => this.props.task.delete()}>x</span>
            </li>
        )
    }
}))

const Tasks = SortableContainer(observer(class Tasks extends React.Component {
    render () {
        return (
            <ul className="tasks list-group widget-content">
                {
                    this.props.widget.tasks.map((task, i) => {
                        return <Task key={task.id} widget={this.props.widget} task={task} index={i} />
                    })
                }
            </ul>
        )
    }
}))

const ChecklistWidget = observer(class ChecklistWidget extends React.Component {
    onSortEnd = ({oldIndex, newIndex, a}) => {
        this.props.widget.updateOrdinal(oldIndex, newIndex);
    }

    render () {
        return (
            <div className="widget checklist-widget">
                <WidgetDelete widget={this.props.widget} />
                <WidgetHeader widget={this.props.widget} />
                <Tasks widget={this.props.widget} onSortEnd={this.onSortEnd} useDragHandle />
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
