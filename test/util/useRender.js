import { useState, useCallback } from "react";

export default function useRender() {
  const [, render] = useState({});

  return useCallback(() => render({}), [render]);
}
