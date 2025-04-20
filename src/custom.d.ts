declare module "react-syntax-highlighter";
declare module "react-syntax-highlighter/dist/esm/styles/prism";

declare module "*.svg" {
  import * as React from "react";
  const SVG: React.FC<React.SVGProps<SVGSVGElement>>;
  export default SVG;
}
