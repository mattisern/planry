import {extendObservable} from "mobx";

export default class Widget {
    id = "";

    constructor (socket, id, name) {
        extendObservable(this, {
            name: "",
            disabled: false
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
        if (window.confirm('Are you sure you want to delete this widget?')) {
            this.socket.emit('deleteWidget', { widgetId: this.id });
        }
    }
}
