import transformer from '../transformer';
import getTheme from '../theme/loader';

let useKatexFilePath = '';

export default async function loader(content: string) {
  const result = transformer.markdown(content, this.resource);
  const theme = await getTheme();

  // mark current file if it contains Katex and there has not another file used Katex
  if (result.content.includes('className={["katex"]}') && !useKatexFilePath) {
    useKatexFilePath = this.resource;
  }

  return `
    import React from 'react';
    import { Link, AnchorLink } from 'dumi/theme';
    ${
      // add Katex css import statement if required or not in production mode, to reduce dist size
      useKatexFilePath === this.resource || process.env.NODE_ENV !== 'production'
        ? "import 'katex/dist/katex.min.css';"
        : ''
    }
    ${theme.builtins
      .concat(theme.fallbacks)
      .map(component => `import ${component.identifier} from '${component.source}';`)
      .join('\n')}

    ${(result.meta.demos || []).join('\n')}

    export default function () {
      return (
        <>
          ${
            result.meta.translateHelp
              ? '<Alert>This article has not been translated yet. Want to help us out? Click the Edit this doc on GitHub at the end of the page.</Alert>'
              : ''
          }
          ${result.content}
        </>
      );
  }`;
}
