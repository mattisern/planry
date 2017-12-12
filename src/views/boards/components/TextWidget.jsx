import React from 'react';

import {reaction, toJS} from "mobx";
import {observer} from "mobx-react";

import Editor, {createEditorStateWithText} from 'draft-js-plugins-editor';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';

import "draft-js/dist/Draft.css"

import WidgetDelete from "./WidgetDelete";
import WidgetHeader from "./WidgetHeader";

import createMarkdownShortcutsPlugin from 'draft-js-markdown-shortcuts-plugin';

const TextWidget = observer(class TextWidget extends React.Component {
    constructor (props) {
        super(props);

        let editorState;
        if (props.widget.richText && props.widget.richText.blocks.length) {
            editorState = EditorState.createWithContent(convertFromRaw(toJS(props.widget.richText)));
        } else {
            editorState = createEditorStateWithText(props.widget.text || "");
        }

        this.state = { 
            editorState
        };
    }

    componentDidMount () {
        this.dispose = reaction(
            () => this.props.widget.richText,
            (text) => {
                if (this.props.widget.isDisabled("text")) {
                    this.setState({
                        editorState: EditorState.createWithContent(convertFromRaw(text))
                    })
                }
            }
        )
    }

    componentWillUnmount () {
        this.dispose();
    }

    render() {
        const isDisabled = this.props.widget.isDisabled("text");
        
        return (
            <div className={"widget text-widget "  + (isDisabled ? "notify-edit" : "")}>                    
                <WidgetDelete widget={this.props.widget} />
                <WidgetHeader widget={this.props.widget} />

                <Editor 
                    editorState={this.state.editorState} 
                    onChange={(editorState) => {
                        this.setState({editorState});
                        const text = editorState.getCurrentContent().getPlainText();
                        const richText = convertToRaw(editorState.getCurrentContent());

                        this.props.widget.update("text", text);
                        this.props.widget.update("richText", richText);
                    }}
                    plugins={[createMarkdownShortcutsPlugin()]}
                    placeholder="Start writing here..."
                    readOnly={isDisabled}               
                    onFocus={(e) => this.props.widget.onStartEditing("text")}
                    onBlur={(e) => this.props.widget.onEndEditing("text")}
                />
            </div>
        );
    }
})

export default TextWidget;
