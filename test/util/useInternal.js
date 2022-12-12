import { isEqual } from "lodash";
import { useRef, useCallback, Dispatch, SetStateAction } from "react";
import useRender from "./useRender";

function compare(value1: unknown, value2: unknown, deep = false) {
  return deep ? isEqual(value1, value2) : value1 === value2
}

export default function useInternal<T>(value: T, deep: boolean = false): [T, Dispatch<SetStateAction<T>>] {
  const render = useRender();

  const internalValue = useRef(value);
  const originalValue = useRef(value);

  const setInternalValue = useCallback((value: T) => {
    if (compare(internalValue.current, value, deep))
      return

    internalValue.current = value

    render();
  }, [internalValue, render])

  if (!compare(originalValue.current, value, deep))
    internalValue.current = originalValue.current = value

  return [internalValue.current, setInternalValue]
}
