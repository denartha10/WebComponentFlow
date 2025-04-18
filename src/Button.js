import van from 'vanjs-core';
const { div, button, label, input } = van.tags;

const isValidNodeCount = (inputs, outputs) => {
  return inputs >= 0 && inputs <= 4 && outputs >= 0 && outputs <= 4;
};

const handleOnClickAddNode = (e, onClickAdd, states) => {
  e.stopPropagation();
  const { numberOfInputs, numberOfOutputs, dropdownOpen } = states;

  const inputs = Number(numberOfInputs.rawVal);
  const outputs = Number(numberOfOutputs.rawVal);

  if (!isValidNodeCount(inputs, outputs)) return;

  dropdownOpen.val = false;
  onClickAdd(inputs, outputs);
  numberOfInputs.val = 0;
  numberOfOutputs.val = 0;
};

const toggleDropdown = (e, dropdownOpen) => {
  e.stopPropagation();
  dropdownOpen.val = !dropdownOpen.val;
};

export const Button = ({ showDelete, onClickAdd, onClickDelete }) => {
  const dropdownOpen = van.state(false);
  const numberOfInputs = van.state(0);
  const numberOfOutputs = van.state(0);

  const states = { dropdownOpen, numberOfInputs, numberOfOutputs };

  return div(
    { class: 'buttonWrapper' },

    // Delete button
    button({ onclick: onClickDelete, class: () => showDelete ? 'buttonDelete' : 'buttonDeleteHidden' }, () => 'X'),

    // Add (+/-) button
    button({ class: 'buttonAdd', onclick: (e) => toggleDropdown(e, dropdownOpen) }, () => dropdownOpen.val ? '-' : '+'),

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
        oninput: (e) => numberOfInputs.val = e.target.value
      }),

      label({ class: 'lablel' }, 'Number of Outputs'),
      input({
        class: 'input',
        type: 'number',
        value: numberOfOutputs,
        oninput: (e) => numberOfOutputs.val = e.target.value
      }),

      // Submit button
      button({
        class: 'buttonRect',
        onclick: (e) => handleOnClickAddNode(e, onClickAdd, states)
      }, 'Add Node')
    )
  );
};

