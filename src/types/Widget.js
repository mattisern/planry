import {extendObservable} from "mobx";

export default class Widget {
    id = "";

    constructor (socket, id, name) {
        extendObservable(this, {
            name: "",
            disabled: []
        })

        this.socket = socket;
        this.id = id;
        this.name = name;
    }

    update (field, value) {
        this.socket.emit("updateWidget", { widgetId: this.id, updateField: field, value });
        this[field] = value;
    }

    delete () {
        if (window.confirm('Are you sure you want to delete this card?')) {
            this.socket.emit('deleteWidget', { widgetId: this.id });
        }
    }

    lock (data) {
        console.log("LOCK", data)
        this.disabled.push(data.field);
    }

    unlock (data) {
        console.log("UNLOCK", data)
        this.disabled = this.disabled.filter((disabled) => {
            return disabled !== data.field;
        })
    }

    isDisabled (field) {
        console.log("FIELD", field, this.disabled.slice())
        return this.disabled.includes(field);
    }

    onStartEditing (field) {
        this.socket.emit('startEditInput', { widgetId: this.id, field, elementId: "widget-" + this.id + "-" + field });
    }

    onEndEditing (field) {
        this.socket.emit('stopEditInput', { widgetId: this.id, field, elementId: "widget-" + this.id + "-" + field });
    }
}
