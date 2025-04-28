import van from 'vanjs-core';
const { div, button, label, input } = van.tags;

export const Button = ({ showDelete, addNode, deleteNode }) => {
  const dropdownOpen = van.state(false);
  const numberOfInputs = van.state(1);
  const numberOfOutputs = van.state(1);

  return div(
    { class: 'buttonWrapper' },

    // Delete button
    button({
      onclick: () => deleteNode(),
      class: () => showDelete ? 'buttonDelete' : 'buttonDeleteHidden'
    },
      'X'
    ),

    // Add (+/-) button
    button(
      {
        class: 'buttonAdd',
        onclick: (e) => { e.stopPropagation(); dropdownOpen.val = !dropdownOpen.val }
      },
      () => dropdownOpen.val ? '-' : '+'
    ),

    // Dropdown
    div(
      {
        id: 'dropdown',
        class: () => dropdownOpen.val ? 'dropdown' : 'dropdownHidden',
      },

      // Input controls
      label({ class: 'lablel' }, 'Number of Inputs'),
      input({
        class: 'input',
        type: 'number',
        value: numberOfInputs,
        min: 0,
        max: 2,
        oninput: (e) => numberOfInputs.val = e.target.value
      }),

      label({ class: 'lablel' }, 'Number of Outputs'),
      input({
        class: 'input',
        type: 'number',
        value: numberOfOutputs,
        min: 0,
        max: 2,
        oninput: (e) => numberOfOutputs.val = e.target.value
      }),

      // Submit button
      button({
        class: 'buttonRect',
        onclick: (e) => { e.stopPropagation; addNode(Number(numberOfInputs.rawVal), Number(numberOfOutputs.rawVal)); dropdownOpen.val = false }
      }, 'Add Node')
    )
  );
};

