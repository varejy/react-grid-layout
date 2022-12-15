// @flow
import * as React from "react";
import _ from "lodash";
import Responsive from '../../lib/ResponsiveReactGridLayout';
import WidthProvider from '../../lib/components/WidthProvider';
import type {CompactType, Layout, LayoutItem, ReactChildren} from '../../lib/utils';
import type {Breakpoint, OnLayoutChangeCallback} from '../../lib/responsiveUtils';
import { Children } from "react/cjs/react.production.min";
import useInternal from "../util/useInternal";
const ResponsiveReactGridLayout = WidthProvider(Responsive);

const GroupLayout = React.forwardRef(
  (
    {
      children,
      elements,
      ...props
    },
    ref
  ) => {
    const elementKeys = React.useMemo(() => elements.map((element) => element.key), [ elements ]);

    const [selectedElementKey, setSelectedElementKey] = useInternal(elementKeys[0]);
    
    const selectedElement = React.useMemo(() => elements.find((element) => element.key === selectedElementKey), selectedElementKey)

    const content = React.useMemo(() => (
      <>
        <div className="react-grid-item-tabs">
          {elementKeys.map((elementKey) => (
            <div
              className={`react-grid-item-tab ${elementKey === selectedElementKey ? "react-grid-item-tab--selected" : ""}`}
              onClick={() => setSelectedElementKey(elementKey)}
            >
              {elementKey}
            </div>
          ))}
        </div>
        <div className="react-grid-item-content">
          {selectedElement}
        </div>
        {children}
      </>
    ), [selectedElementKey])
    
    return (
      <div
        ref={ref}
        {...props}
      >
        {content}
      </div>
    )
  }
)

function generateDOMElement(element) {
  return Array.isArray(element.i)
    ? element.i.map((i) => generateDOMElement({ ...element, i }))
    : (
      <div key={element.i} className={`element ${element.static ? "static" : ""}`}>
        {element.static ? (
          <span
            className="text"
            title="This item is static and cannot be removed or resized."
          >
            Static - {element.i}
          </span>
        ) : (
          <span className="text">{element.i}</span>
        )}
      </div>
    )
}

type Props = {|
  className: string,
  cols: {[string]: number},
  onLayoutChange: Function,
  rowHeight: number,
|};
type State = {|
  currentBreakpoint: string,
  compactType: CompactType,
  mounted: boolean,
  layouts: {[string]: Layout}
|};

export default class ShowcaseLayout extends React.Component<Props, State> {
  static defaultProps: Props = {
    className: "layout",
    rowHeight: 30,
    onLayoutChange: function() {},
    cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
  };

  state: State = {
    currentBreakpoint: "lg",
    compactType: "vertical",
    mounted: false,
    layouts: { lg: generateLayout() }
  };

  componentDidMount() {
    this.setState({ mounted: true });
  }

  generateDOM(): ReactChildren {
    return _.map(this.state.layouts.lg, generateDOMElement).flat(1);
  }

  onBreakpointChange: (Breakpoint) => void = (breakpoint) => {
    this.setState({
      currentBreakpoint: breakpoint
    });
  };

  onCompactTypeChange: () => void = () => {
    const { compactType: oldCompactType } = this.state;
    const compactType =
      oldCompactType === "horizontal"
        ? "vertical"
        : oldCompactType === "vertical"
        ? null
        : "horizontal";
    this.setState({ compactType });
  };

  onLayoutChange: OnLayoutChangeCallback = (layout, layouts) => {
    this.props.onLayoutChange(layout, layouts);
  };

  onNewLayout: EventHandler = () => {
    this.setState({
      layouts: { lg: generateLayout() }
    });
  };

  onDrop: (layout: Layout, item: ?LayoutItem, e: Event) => void = (elemParams) => {
    alert(`Element parameters: ${JSON.stringify(elemParams)}`);
  };

  render(): React.Node {
    // eslint-disable-next-line no-unused-vars
    return (
      <div>
        <div>
          Current Breakpoint: {this.state.currentBreakpoint} (
          {this.props.cols[this.state.currentBreakpoint]} columns)
        </div>
        <div>
          Compaction type:{" "}
          {_.capitalize(this.state.compactType) || "No Compaction"}
        </div>
        <button onClick={this.onNewLayout}>Generate New Layout</button>
        <button onClick={this.onCompactTypeChange}>
          Change Compaction Type
        </button>
        <ResponsiveReactGridLayout
          {...this.props}
          layouts={this.state.layouts}
          onBreakpointChange={this.onBreakpointChange}
          onLayoutChange={this.onLayoutChange}
          onDrop={this.onDrop}
          // WidthProvider option
          measureBeforeMount={false}
          // I like to have it animate on mount. If you don't, delete `useCSSTransforms` (it's default `true`)
          // and set `measureBeforeMount={true}`.
          useCSSTransforms={this.state.mounted}
          compactType={this.state.compactType}
          preventCollision={!this.state.compactType}
          useGroups
          GroupLayout={GroupLayout}
        >
          {this.generateDOM()}
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}

function generateLayout() {
  let index = 0;
  
  return _.map(_.range(0, 25), function(item, i) {
    var isGroup = Math.random() < 0.1;
    var y = Math.ceil(Math.random() * 4) + 1;

    return {
      x: Math.round(Math.random() * 5) * 2,
      y: Math.floor(i / 6) * y,
      w: 2,
      h: y,
      minW: 2,
      minH: 2,
      i: isGroup
        ? Array(Math.ceil(Math.random() * 4))
            .fill(null)
            .map(() => (index++).toString())
        : (index++).toString(),
      static: Math.random() < 0.05,
      groupable: true
    };
  });
}

if (process.env.STATIC_EXAMPLES === true) {
  import("../test-hook.jsx").then(fn => fn.default(ShowcaseLayout));
}
