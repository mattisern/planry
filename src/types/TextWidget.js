import {extendObservable} from "mobx";
import Widget from "./Widget";

export default class TextWidget extends Widget {
    kind = "text";

    constructor (socket, id, name, text, richText) {     
        super(socket, id, name);

        extendObservable(this, {
            text: "",
            richText: {entityMap: {}, blocks: []}
        });

        if (text) { this.text = text };
        if (richText) { this.richText = richText };
    }
}
