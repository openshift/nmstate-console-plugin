import React, { ReactNode } from 'react';

/**
 * Mock tranlation utility
 *
 * @returns {{ t: (k: string) => string; }}
 */
const interpolate = (key: string, options?: Record<string, unknown>): string =>
  options
    ? key.replace(/\{\{(\w+)\}\}/g, (_match, name: string) => String(options[name] ?? ''))
    : key;

/** Renders children, turning i18next interpolation objects (`{ name: 'x' }`) into text. */
const isInterpolationObject = (node: ReactNode): boolean =>
  Boolean(node) && typeof node === 'object' && !Array.isArray(node) && !React.isValidElement(node);

const renderNode = (node: ReactNode): ReactNode => {
  // `React.Children.map` throws on a plain object inside an array before calling the callback
  // (`Objects are not valid as a React child`), so arrays are traversed here and keyed explicitly.
  if (Array.isArray(node)) {
    return node.map((child, index) => (
      <React.Fragment key={index}>{renderNode(child)}</React.Fragment>
    ));
  }
  if (React.isValidElement<{ children?: ReactNode }>(node)) {
    return React.cloneElement(node, {}, renderChildren(node.props.children));
  }
  if (isInterpolationObject(node)) {
    return Object.values(node as unknown as Record<string, unknown>).join('');
  }
  return node;
};

// A plain object child has to be converted before React traverses it, so handle it up front.
const renderChildren = (children: ReactNode): ReactNode =>
  isInterpolationObject(children)
    ? Object.values(children as unknown as Record<string, unknown>).join('')
    : renderNode(children);

export const Trans = ({ children }: { children?: ReactNode }) => <>{renderNode(children)}</>;

export const getI18n = () => ({
  t: (key: string, options?: Record<string, unknown>) => interpolate(key, options),
});

export const useTranslation = () => ({
  t: (k: string, options?: Record<string, unknown>) => interpolate(k, options),
  i18n: {
    resolvedLanguage: 'en',
  },
});
