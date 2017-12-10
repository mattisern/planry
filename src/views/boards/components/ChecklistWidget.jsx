import React from 'react';

import {observer} from "mobx-react"

import WidgetDelete from "./WidgetDelete";
import WidgetHeader from "./WidgetHeader";

const Task = observer(class Task extends React.Component {
    handleKeyUp = (e) => {
        if (e.key.toLowerCase() === "enter") {
            this.props.widget.addTask();
        }
    }

    componentDidMount () {
        if (this.props.widget.didAdd) {
            this.input.focus();
            this.props.widget.didAdd = false;
        }
    }

    render () {
        const isDisabled = this.props.task.disabled;

        return (
            <li className="list-group-item d-flex justify-content-between align-items-center">
                <label>
                    <input
                        type="checkbox"
                        checked={this.props.task.completed}
                        onChange={(e) => this.props.task.update("completed", e.target.checked)}
                    />
                    <span className="checkbox" /> {/* HIDE THE CHECKBOX AND STYLE THE SPAN TO LOOK LIKE A CHECKBOX. input + span {} AND input:checked + span {} */}
                </label>
                <input
                    ref={(i) => this.input = i}
                    type="text"
                    className={"editable-label " + (isDisabled ? "notify-edit" : "")}
                    disabled={isDisabled}
                    placeholder="New Task"
                    value={this.props.task.description}
                    onChange={(e) => this.props.task.update("description", e.target.value)}
                    onFocus={(e) => this.props.task.onStartEditing("description")}
                    onBlur={(e) => this.props.task.onEndEditing("description")}
                    onKeyUp={this.handleKeyUp}
                />
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
