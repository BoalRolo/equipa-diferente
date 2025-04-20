declare module "react-syntax-highlighter/dist/esm/prism-async-light" {
  import { ComponentType } from "react";

  interface SyntaxHighlighterProps {
    language?: string;
    style?: { [key: string]: React.CSSProperties };
    children: string | string[];
    customStyle?: React.CSSProperties;
    codeTagProps?: React.HTMLProps<HTMLElement>;
    useInlineStyles?: boolean;
    showLineNumbers?: boolean;
    showInlineLineNumbers?: boolean;
    startingLineNumber?: number;
    lineNumberContainerStyle?: React.CSSProperties;
    lineNumberStyle?:
      | React.CSSProperties
      | ((lineNumber: number) => React.CSSProperties);
    wrapLines?: boolean;
    wrapLongLines?: boolean;
    lineProps?:
      | ((lineNumber: number) => React.HTMLProps<HTMLElement>)
      | React.HTMLProps<HTMLElement>;
    PreTag?: keyof React.JSX.IntrinsicElements | ComponentType<any>;
    CodeTag?: keyof React.JSX.IntrinsicElements | ComponentType<any>;
    className?: string;
  }

  export default class SyntaxHighlighter extends React.Component<SyntaxHighlighterProps> {
    static registerLanguage(name: string, func: any): void;
  }
}

declare module "react-syntax-highlighter/dist/esm/styles/prism" {
  export const tomorrow: { [key: string]: React.CSSProperties };
}

declare module "react-syntax-highlighter/dist/cjs/styles/prism/one-dark" {
  const style: { [key: string]: React.CSSProperties };
  export default style;
}
