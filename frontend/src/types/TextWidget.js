import {extendObservable} from "mobx";
import Widget from "./Widget";

export default class TextWidget extends Widget {
    kind = "text";

    constructor (socket, id, name, text) {     
        super(socket, id, name);

        extendObservable(this, {
            text: ""
        });

        this.text = text;
    }
}
