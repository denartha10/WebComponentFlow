import van from 'vanjs-core';
import { getCenterCoordinates } from './utilities';
const { div } = van.tags;


/**
 * @typedef {Object} NodeProps
 * @property {string} id - The unique identifier for the node.
 * @property {number} x - The x-coordinate of the node.
 * @property {number} y - The y-coordinate of the node.
 * @property {number} numberInputs - The number of inputs for the node.
 * @property {number} numberOutputs - The number of outputs for the node.
 * @property {boolean} selected - Whether the node is selected.
 *
 * @property {function(string, any): void} onSelect - Callback function when the node is clicked.
 * @property {function(number, number, string, number): void} onMouseDownOutput - Callback function when an output is clicked.
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
  const handleMouseEnterInput = (inputId) => {
    props.onMouseEnterInput(props.id, inputId)
  };

  const handleMouseLeaveInput = () => {
    props.onMouseLeaveInput()
  };

  const handleMouseDownOutput = (ref, e, outputIndex) => {
    e.stopPropagation();
    const { centerX, centerY } = getCenterCoordinates(ref);
    props.onMouseDownOutput(props.id, outputIndex, { x: centerX, y: centerY });
  };

  const renderInputs = () =>
    Array.from({ length: Number(props.numberInputs) }).map((_, index) => {
      let inputId = `input_${Math.random().toString(36).substring(2, 8)}`;
      return div(
        {
          class: 'nodeInput',
          id: inputId,
          onmouseenter: () => handleMouseEnterInput(inputId),
          onmouseleave: () => handleMouseLeaveInput(index),
        }
      );
    });

  const renderOutputs = () =>
    Array.from({ length: Number(props.numberOutputs) }).map((_, index) => {
      let outputId = `output_${Math.random().toString(36).substring(2, 8)}`;
      return div(
        {
          class: 'nodeOutput',
          id: outputId,
          onmousedown: (e) => handleMouseDownOutput(e.target, e, index),
        }
      );
    });

  return div(
    {
      id: props.id,
      class: props.selected ? 'nodeSelected' : 'node',
      style: () => `transform: translate(${props.position.x}px, ${props.position.y}px);`,
      onmousedown: (e) => {
        e.stopPropagation();
        props.onSelect(e);
      },
    },

    // Render Inputs Section
    div({ class: 'nodeInputsWrapper' }, renderInputs()),

    // Render Outputs Section
    div({ class: 'nodeOutputsWrapper' }, renderOutputs())
  );
};
