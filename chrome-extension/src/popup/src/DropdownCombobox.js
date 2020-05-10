import React, {useEffect, useState} from "react"
import {useCombobox} from "downshift"
import {comboboxStyles, menuStyles} from "./utils"

export function DropdownCombobox({items, onChange}) {
  const [inputItems, setInputItems] = useState(items)
  const itemToString = (team) => team ? team.name : ''
  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({
    items: inputItems,
    initialInputValue: "",
    initialIsOpen: true,
    onInputValueChange: ({inputValue}) => {
      setInputItems(
        items.filter(item =>
          itemToString(item).toLowerCase().indexOf(inputValue.toLowerCase())>-1
        )
      )
    },
    onSelectedItemChange: (state) => {
      const {selectedItem} = state
      onChange(selectedItem)
    },
    itemToString
  })

  return (
    <div>
      <label {...getLabelProps()}>Select your team:</label>
      <div style={comboboxStyles} {...getComboboxProps()}>
        <input style={{width:"100px"}} {...getInputProps()} />
        <button {...getToggleButtonProps()} aria-label="toggle menu">
          Show all
        </button>
      </div>
      <ul {...getMenuProps()} style={menuStyles}>
        {isOpen &&
        inputItems.map((item, index) => (
          <li
            style={
              highlightedIndex === index ? {backgroundColor: "#bde4ff"} : {}
            }
            key={`${item.name}${index}`}
            {...getItemProps({item, index})}
          >
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  )
}
