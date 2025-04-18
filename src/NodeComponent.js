import van from 'vanjs-core';
const { div } = van.tags;

const getCenterCoordinates = (ref) => {
  const rect = ref.getBoundingClientRect();
  const centerX = rect.left + Math.abs(rect.right - rect.left) / 2;
  const centerY = rect.top + Math.abs(rect.bottom - rect.top) / 2;
  return { centerX, centerY };
};

/**
 * @typedef {Object} NodeProps
 * @property {string} id - The unique identifier for the node.
 * @property {number} x - The x-coordinate of the node.
 * @property {number} y - The y-coordinate of the node.
 * @property {number} numberInputs - The number of inputs for the node.
 * @property {number} numberOutputs - The number of outputs for the node.
 * @property {boolean} selected - Whether the node is selected.
 *
 * @property {function(string, any): void} onMouseDownNode - Callback function when the node is clicked.
 * @property {function(number, number, string, number): void} onMouseDownOutput - Callback function when an output is clicked.
 *
 * @property {function(number, number, string, number): void} onMouseEnterInput - Callback function when an input is entered.
 * @property {function(string, number): void} onMouseLeaveInput - Callback function when an input is left.
 */

/**
 * NodeComponent renders a node with interactive input and output areas.
 *
 * @param {NodeProps} props - The properties for the node.
 * @returns {HTMLElement} The rendered node element.
 */
export const NodeComponent = (props) => {
  const handleMouseEnterInput = (ref, inputIndex) => {
    const { centerX, centerY } = getCenterCoordinates(ref);
    props.onMouseEnterInput(centerX, centerY, props.id, inputIndex);
  };

  const handleMouseLeaveInput = (inputIndex) => {
    props.onMouseLeaveInput(props.id, inputIndex);
  };

  const handleMouseDownOutput = (ref, e, outputIndex) => {
    e.stopPropagation();
    const { centerX, centerY } = getCenterCoordinates(ref);
    props.onMouseDownOutput(centerX, centerY, props.id, outputIndex);
  };

  const renderInputs = () =>
    Array.from({ length: Number(props.numberInputs) }).map((_, index) => {
      // TODO: find a way to reference this element
      let inputRef = `input_${Math.random().toString(36).substring(2, 8)}`;
      return div(
        {
          class: 'nodeInput',
          onmouseenter: (e) => handleMouseEnterInput(e.target, index), //TODO: Temporary fix for reference problem
          onmouseleave: () => handleMouseLeaveInput(index),
        }
      );
    });

  const renderOutputs = () =>
    Array.from({ length: Number(props.numberOutputs) }).map((_, index) => {
      // TODO: find a way to reference this element
      let outputRef = `output_${Math.random().toString(36).substring(2, 8)}`;
      return div(
        {
          class: 'nodeOutput',
          onmousedown: (e) => handleMouseDownOutput(e.target, e, index), //TODO: Temporary fix for reference problem
        }
      );
    });

  return div(
    {
      id: props.id,
      class: props.selected ? 'nodeSelected' : 'node',
      style: () => `transform: translate(${props.x}px, ${props.y}px);`,
      onmousedown: (e) => {
        e.stopPropagation();
        props.onMouseDownNode(props.id, e);
      },
    },
    // Render Inputs Section
    div({ class: 'nodeInputsWrapper' }, renderInputs()),
    // Render Outputs Section
    div({ class: 'nodeOutputsWrapper' }, renderOutputs())
  );
};
