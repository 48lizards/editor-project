import React from "react";
import { BaseElement } from "slate";
import { RenderElementProps, useSlateStatic } from "slate-react";

export enum CustomElementType {
  blockQuote = "block-quote",
  bulletedList = "bulleted-list",
  headingOne = "heading-one",
  headingTwo = "heading-two",
  listItem = "list-item",
  numberedList = "numbered-list",
  paragraph = "paragraph",
  link = "link",
  code = "code",
}

export interface CustomElement extends BaseElement {
  type: CustomElementType;
  url?: string;
}

export const CustomElement: React.FC<RenderElementProps> = ({
  attributes,
  children,
  element,
}) => {
  const editor = useSlateStatic();
  switch (element.type) {
    case CustomElementType.blockQuote:
      return <blockquote {...attributes}>{children}</blockquote>;
    case CustomElementType.bulletedList:
      return <ul {...attributes}>{children}</ul>;
    case CustomElementType.headingOne:
      return <h1 {...attributes}>{children}</h1>;
    case CustomElementType.headingTwo:
      return <h2 {...attributes}>{children}</h2>;
    case CustomElementType.listItem:
      return <li {...attributes}>{children}</li>;
    case CustomElementType.numberedList:
      return <ol {...attributes}>{children}</ol>;
    case CustomElementType.link:
      return editor.linkElementType({ attributes, children, element });
      return (
        <a
          href={element.url}
          onClick={(e) => {
            if (e.metaKey) {
              window.open(element.url, "_blank");
            }
          }}
          {...attributes}
        >
          {children}
        </a>
      );
    case CustomElementType.code:
      return (
        <pre>
          <code {...attributes}>{children}</code>
        </pre>
      );
    default:
      return <p {...attributes}>{children}</p>;
  }
};
