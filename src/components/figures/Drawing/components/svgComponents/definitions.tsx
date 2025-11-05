import { Ref, HTMLAttributes } from 'react';

export interface DefaultObjectProps<T extends Element = Element> extends HTMLAttributes<T> {
  ref?: Ref<T>;
}

export const getDefaultObject = <T extends Element>(): DefaultObjectProps<T> => ({
  ref: undefined,
});
