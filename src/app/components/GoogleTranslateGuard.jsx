'use client';

// Browser "Translate this page" tools (Google Translate, Chrome/Edge Translate)
// rewrite text nodes into wrapper elements outside of React's control. When
// React later reconciles/unmounts that subtree (e.g. on client-side
// navigation), it tries to removeChild/insertBefore a node that no longer
// matches the live DOM and throws, crashing the whole app. Patch these DOM
// methods to skip the mismatched operation instead of throwing.
// See: https://github.com/facebook/react/issues/11538
if (typeof window !== 'undefined' && Node.prototype && !Node.prototype.__translateGuardPatched) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function removeChild(child) {
    if (child.parentNode !== this) {
      console.warn(
        '[GoogleTranslateGuard] Skipped removeChild: node is not a child of this parent (likely a browser translation tool mutated the DOM).'
      );
      return child;
    }
    return originalRemoveChild.call(this, child);
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function insertBefore(newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      console.warn(
        '[GoogleTranslateGuard] Skipped insertBefore: reference node is not a child of this parent (likely a browser translation tool mutated the DOM).'
      );
      return newNode;
    }
    return originalInsertBefore.call(this, newNode, referenceNode);
  };

  Node.prototype.__translateGuardPatched = true;
}

export default function GoogleTranslateGuard() {
  return null;
}
