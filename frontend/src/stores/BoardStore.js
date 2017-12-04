import {extendObservable} from "mobx";

import Widget from "../types/Widget";
import ChecklistWidget from "../types/ChecklistWidget";
import TextWidget from "../types/TextWidget";

import client from "../client";
import socket from "../socket";
    
class BoardStore {
    constructor () {
        extendObservable(this, {
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
            console.log("Start editing", data)
        });
        
        this.socket.on("stopEditInput", (data) => {            
            console.log("Start editing", data)
        });

        this.socket.on('updateWidget', (data) => {
            const foundWidget = this.findWidget(data.widgetId);
            foundWidget[data.updateField] = data.newState[data.updateField];
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
            this.create();
            return;
        }

        this.isLoading = true;
        
        client.get("/boards/" + uuid).then((res) => {
            this.isLoading = false;
            return this.parseBackend(res)
        });

        return this;
    }

    create () {
        this.isLoading.set(true);
        
        client.post("/boards").then((res) => {
            this.isLoading.set(false);
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

        data.widgets.forEach((widget) => {
            this.widgets.push(this.createWidget(widget));
        });
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
}

export default new BoardStore();
