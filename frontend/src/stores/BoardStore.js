import {extendObservable} from "mobx";

import ChecklistWidget from "../types/ChecklistWidget";
import TextWidget from "../types/TextWidget";

import client from "../client";
import socket from "../socket";
    
class BoardStore {
    constructor () {
        extendObservable(this, {
            id: "",
            identifier: "",
            isLoading: false,
            widgets: [],
            name: "",
            disabled: false
        });
    }

    setup () {
        this.socket = socket(this.identifier)

        this.socket.on("titleUpdated", (data) => {
            this.name = data.name;
        });

        this.socket.on("startEditInput", (data) => {
            if (!data.widgetId) {
                switch (data.field) {
                    case "title":
                        this.lockTitle();
                        break;
                    default:
                        break;
                }
            }

            const foundWidget = this.findWidget(data.widgetId);
            if (foundWidget) {
                foundWidget.lock(data);
            }
        });
        
        this.socket.on("stopEditInput", (data) => {        
            if (!data.widgetId) {
                switch (data.field) {
                    case "title":
                        this.unlockTitle();
                        break;
                    default:
                        break;
                }
            }

            const foundWidget = this.findWidget(data.widgetId);
            if (foundWidget) {
                foundWidget.unlock(data);
            }
        });

        this.socket.on('updateWidget', (data) => {
            const foundWidget = this.findWidget(data.widgetId);
            if (foundWidget) {
                foundWidget[data.updateField] = data.newState[data.updateField];
            }
        });

        this.socket.on('deleteWidget', (data) => {
            this.widgets = this.widgets.filter((widget) => {
                return widget.id !== data.widgetId;
            });
        });

        this.socket.on('addWidget', (data) => {
            this.widgets.push(this.createWidget(data.widget));
        });
    }

    updateTitle (name) {
        this.socket.emit("titleUpdated", {board: this.id, title: name})
        this.name = name;
    }

    lockTitle () {
        this.disabled = true;
    }
    
    unlockTitle () {
        this.disabled = false;
    }

    addWidget (type) {
        this.socket.emit('addWidget', {boardId: this.id, type: type});
    }
    
    findWidget (id) {
        return this.widgets.find((widget) => {
            return widget.id === id;
        });
    }

    get (uuid) {
        if (!uuid) {
            return this.create();
        }

        this.isLoading = true;
        
        client.get("/boards/" + uuid).then((res) => {
            this.isLoading = false;
            return this.parseBackend(res)
        });

        return this;
    }

    create () {
        this.isLoading = true;
        
        client.post("/boards").then((res) => {
            this.isLoading = false;
            return this.parseBackend(res)
        });

        return this;
    }

    parseBackend (res) {
        const data = res.data;

        this.name = data.name;
        this.id = data.id;
        this.identifier = data.identifier;
        
        this.setup();

        if (data.widgets) {
            data.widgets.forEach((widget) => {
                this.widgets.push(this.createWidget(widget));
            });
        }
    }

    createWidget (widget) {
        switch(widget.type) {
            case 1:
                return new TextWidget(this.socket, widget.id, widget.state.name, widget.state.text);
            case 2:
                return new ChecklistWidget(this.socket, widget.id, widget.state.name, widget.state.tasks);
            default:
                return null
        }
    }

    onStartEditing (field) {
        this.socket.emit('startEditInput', { field, elementId: field });
    }

    onEndEditing (field) {
        this.socket.emit('stopEditInput', { field, elementId: field });
    }
}

export default new BoardStore();
