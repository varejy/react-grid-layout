import { forwardRef, memo } from "react";

export const Groupable = memo(forwardRef(({
  children,
  disabled,

  elements,

  Container,

  ...props
}, ref) => {
  return disabled
    ? children
    : (
      <Container
        ref={ref}
        elements={elements}
        {...props}
      >
        {children}
      </Container>
    )
}))
