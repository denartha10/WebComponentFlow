import van from 'vanjs-core'

const { svg, path, g, circle } = van.tags("http://www.w3.org/2000/svg")

/**
  * @function EdgeComponent
  * @param {object} props
  * @param {boolean} props.selected - Whether the edge is selected 
  * @param {boolean} props.isNew - Whether the edge is newly created or old 
  * @param {object} props.position - the x and y coordinates of both line ends 
  * @param {number} props.position.x0 - the x and y coordinates of both line ends 
  * @param {number} props.position.y0 - the x and y coordinates of both line ends 
  * @param {number} props.position.x1 - the x and y coordinates of both line ends 
  * @param {number} props.position.y1 - the x and y coordinates of both line ends 
  * @param {function(): void} props.onMouseDownEdge - Callback function when an edge is clicked
  * @param {function(): void} props.onClickDelete - Callback to delete edge
  */
export const EdgeComponent = (props) => {

  const middlePoint = van.state({
    x: props.position.x0 + (props.position.x1 - props.position.x0) / 2,
    y: props.position.y0 + (props.position.y1 - props.position.y0) / 2
  })

  const handleOnMouseDownEdge = (e) => {
    e.stopPropagation();
    props.onMouseDownEdge(e.currentTarget.id, e);
  }

  const handleOnClickDelete = (e) => {
    e.stopPropagation();
    props.onClickDelete()
  }

  const calculateOffset = (value) => {
    return value / 2
  }

  const { x0, y0, x1, y1 } = props.position;
  const dx = calculateOffset(Math.abs(x1 - x0));

  return svg(
    { class: 'edgeWrapper' },
    path({
      class: props.isNew ? 'edgeNew' : props.selected ? 'edgeSelected' : 'edge',
      d: `M ${x0} ${y0} C ${x0 + dx} ${y0}, ${x1 - dx} ${y1}, ${x1} ${y1}`,
      onmousedown: handleOnMouseDownEdge
    }),

    g(
      {
        class: props.selected ? 'edgeDelete' : 'edgeDeleteHidden',
        transform: `translate(${middlePoint.val.x}, ${middlePoint.val.y - (props.selected ? 24 : 0)})`,
        onmousedown: handleOnClickDelete
      },
      circle({ cx: 0, cy: 0, r: 14, fill: 'rgb(175, 59, 59)', class: 'circle' }),
      svg(
        {
          fill: "currentColor",
          "stroke-width": 0,
          width: 30,
          height: 30,
          viewBox: "210 240 1000 1000",
          style: "overflow: visible;",
          class: "icon"
        },
        path({
          d: "m170.5 51.6-19 28.4h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6h-93.7c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6 36.7 55H424c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8v304c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128h-8c-13.3 0-24-10.7-24-24s10.7-24 24-24h69.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128v304c0 17.7 14.3 32 32 32h224c17.7 0 32-14.3 32-32V128H80zm80 64v208c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0v208c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0v208c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z"
        })
      )
    )
  );
}
