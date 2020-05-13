import React, {useState} from "react"
import {useCombobox} from "downshift"

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
      <label {...getLabelProps()}><h4>Choose your team and listen to your favorite chants</h4></label>
      <div {...getComboboxProps()}>
        <input style={{width:"100%"}} {...getInputProps()} />
      </div>
      <ul className={"team-list"} {...getMenuProps()}>
        {isOpen &&
        inputItems.map((item, index) => (
          <li
            className={highlightedIndex === index ? "highlighted" : ""}
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
