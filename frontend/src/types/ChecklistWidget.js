import {extendObservable} from "mobx";
import Widget from "./Widget";

export default class ChecklistWidget extends Widget {
    kind = "checklist";

    constructor (socket, id, name, tasks) {
        super(socket, id, name);
        
        extendObservable(this, {
            tasks: []
        })

        if (tasks) {
            this.tasks = tasks.map((task) => {
                return new ChecklistItem(this.socket, this.id, task.id, task.description, task.completed);
            })
        }

        this.socket.on('updateTask', (data) => {
            const foundTask = this.findTask(data.task.id);
            foundTask[data.updateField] = data.task[data.updateField];
        });

        this.socket.on('deleteTask', (data) => {
            this.tasks = this.tasks.filter((task) => {
                return task.id !== data.taskId;
            });
        });

        this.socket.on('addWidgetTask', (data) => {
            if (data.widget.id === this.id) {
                this.tasks.push(new ChecklistItem(this.socket, this.id, data.task.id, data.task.description, data.task.com));
            }
        })
    }

    findTask (id) {
        return this.tasks.find((task) => {
            return task.id === id;
        });
    }

    disableItem (id) {
        this.findTask(id).disabled = true;
    }
    
    addTask () {
        this.socket.emit('addWidgetTask', {widgetId: this.id});
    }
    
}

class ChecklistItem {
    id = "";

    constructor (socket, widgetId, id, description, completed) {
        extendObservable(this, {
            description: "",
            completed: false,
            disabled: false,
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
}