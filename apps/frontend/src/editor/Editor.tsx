// @refresh reset // Fixes hot refresh errors in development https://github.com/ianstormtaylor/slate/issues/3477

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createEditor, Descendant, BaseEditor } from "slate";
import { withHistory, HistoryEditor } from "slate-history";
import { withYjs, YjsEditor, SyncElement } from "slate-yjs";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import {
  onKeyDown as linkifyOnKeyDown,
  withLinkify,
  ReactEditorExtended,
} from "@mercuriya/slate-linkify";
import { withHtml } from "./withHtml";
import { handleHotkeys } from "./helpers";

import { Editable, withReact, Slate } from "slate-react";
import { EditorToolbar } from "./EditorToolbar";
import { CustomElement } from "./CustomElement";
import { CustomLeaf, CustomText } from "./CustomLeaf";

// Slate suggests overwriting the module to include the ReactEditor, Custom Elements & Text
// https://docs.slatejs.org/concepts/12-typescript
declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditorExtended & HistoryEditor & YjsEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

interface EditorProps {
  initialValue?: Descendant[];
  placeholder?: string;
  onChange: (value: Descendant[]) => void;
}

export const Editor: React.FC<EditorProps> = ({
  initialValue = [],
  placeholder,
  onChange,
}) => {
  const [value, setValue] = useState<Descendant[]>(initialValue);

  const renderElement = useCallback(
    (props) => <CustomElement {...props} />,
    []
  );
  const renderLeaf = useCallback((props) => <CustomLeaf {...props} />, []);

  const id = "n1";
  const [sharedType, provider] = useMemo(() => {
    const doc = new Y.Doc();
    const sharedType = doc.getArray<SyncElement>("content");
    const provider = new WebsocketProvider(
      "ws://localhost:3001/notes",
      "n1",
      doc,
      { connect: false }
    );
    return [sharedType, provider];
  }, [id]);

  const editor = useMemo(
    () =>
      withYjs(
        // @ts-expect-error todo
        withHtml(withReact(withHistory(withLinkify(createEditor())))),
        sharedType
      ),
    []
  );
  const onKeyDown = useCallback(function handleKeyDown(event) {
    linkifyOnKeyDown(event, editor);
    handleHotkeys(editor)(event);
  }, []);

  useEffect(() => {
    provider.on("status", ({ status }: { status: string }) => {
      console.log({ status });
    });
    provider.on("sync", (isSynced: boolean) => {
      console.log({ isSynced });
    });
    console.log("effect running");
    provider.connect();

    return () => {
      provider.disconnect();
    };
  }, [provider]);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(val) => {
        setValue(val);
        onChange(val);
      }}
    >
      <EditorToolbar />
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder={placeholder}
        onKeyDown={onKeyDown}
        // The dev server injects extra values to the editr and the console complains
        // so we override them here to remove the message
        autoCapitalize="false"
        autoCorrect="false"
        spellCheck="false"
      />
    </Slate>
  );
};
