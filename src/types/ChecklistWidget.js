import {extendObservable, action} from "mobx";
import Widget from "./Widget";
import ChecklistItem from "./ChecklistItem";
import {arrayMove} from 'react-sortable-hoc';

export default class ChecklistWidget extends Widget {
    kind = "checklist";

    constructor (socket, id, name, tasks) {
        super(socket, id, name);
        
        extendObservable(this, {
            tasks: []
        })

        if (tasks) {
            this.tasks = tasks.map((task) => {
                return new ChecklistItem(this.socket, this.id, task.id, task.description, task.completed, task.ordinal);
            })
        }

        this.socket.on('updateTask', (data) => {
            const foundTask = this.findTask(data.task.id);
            if (foundTask) {
                foundTask[data.updateField] = data.task[data.updateField];
            }
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
        });

        this.socket.on('updateTasksOrdinal', (data) => {
            if (data.widget.id === this.id) {
                this.tasks = arrayMove(this.tasks, data.oldIndex, data.newIndex);
            }
        });
    }

    findTask (id) {
        return this.tasks.find((task) => {
            return task.id === id;
        });
    }

    lock (data) {
        if (data.taskId) {
            this.lockItem(data.taskId);
        }

        Widget.prototype.lock.call(this, data);
    }

    unlock (data) {
        if (data.taskId) {
            this.unlockItem(data.taskId);
        }

        Widget.prototype.unlock.call(this, data);
    }

    lockItem (id) {
        const foundTask = this.findTask(id);
        if (foundTask) {
            foundTask.lock();
        }
    }

    unlockItem (id) {
        const foundTask = this.findTask(id);
        if (foundTask) {
            foundTask.unlock();
        }
    }
    
    addTask () {
        this.didAdd = true;
        this.socket.emit('addWidgetTask', {widgetId: this.id});
    }

    updateOrdinal = action((oldIndex, newIndex) => {
        this.tasks = arrayMove(this.tasks, oldIndex, newIndex);
        this.socket.emit('updateTasksOrdinal', {widgetId: this.id, oldIndex, newIndex});
    })
}
