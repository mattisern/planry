import {extendObservable} from "mobx";

export default class ChecklistItem {
    id = "";

    constructor (socket, widgetId, id, description, completed) {
        extendObservable(this, {
            description: "",
            completed: false,
            disabled: false
        })

        this.socket = socket;
        this.id = id;
        this.widgetId = widgetId;
        this.description = description;
        this.completed = completed;
    }

    update (field, value) {
        this.socket.emit('updateTask', {
            widgetId: this.widgetId,
            taskId: this.id,
            updateField: field,
            value 
        });

        this[field] = value;
    }

    delete () {
        this.socket.emit('deleteTask', {widgetId: this.widgetId, taskId: this.id});
    }

    lock () {
        this.disabled = true;
    }
    
    unlock () {
        this.disabled = false;
    }

    onStartEditing (field) {
        this.socket.emit('startEditInput', { 
            widgetId: this.widgetId, 
            taskId: this.id, 
            field, 
            elementId: "task-" + this.id + "-" + field 
        });
    }

    onEndEditing (field) {
        this.socket.emit('stopEditInput', { 
            widgetId: this.widgetId, 
            taskId: this.id, 
            field, 
            elementId: "task-" + this.id + "-" + field 
        });
    }
}
