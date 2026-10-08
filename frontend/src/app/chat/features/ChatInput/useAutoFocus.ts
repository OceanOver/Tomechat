import { RefObject, useEffect } from 'react';

export const useAutoFocus = (inputRef: RefObject<HTMLTextAreaElement>) => {
  useEffect(() => {
    let isInputOrMarkdown = false;

    const onMousedown = (e: MouseEvent) => {
      isInputOrMarkdown = false;
      const element = document.elementFromPoint(e.clientX, e.clientY);
      if (!element) return;
      let currentElement: Element | null = element;
      // Clicking a Markdown element yields one of its descendants (article children),
      // and clicking debug info yields a pre element — walk up the tree to see
      // whether the click landed inside a Markdown, Input, or Debug element.
      while (currentElement && !isInputOrMarkdown) {
        isInputOrMarkdown = ['TEXTAREA', 'INPUT', 'ARTICLE', 'PRE'].includes(
          currentElement.tagName,
        );
        currentElement = currentElement.parentElement;
      }
    };

    const onMouseup = () => {
      // Users may copy generated Markdown content or click another input,
      // so only refocus when the click landed outside those elements.
      if (!isInputOrMarkdown) {
        inputRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', onMousedown);
    document.addEventListener('mouseup', onMouseup);
    return () => {
      document.removeEventListener('mousedown', onMousedown);
      document.removeEventListener('mouseup', onMouseup);
    };
  }, []);
};
