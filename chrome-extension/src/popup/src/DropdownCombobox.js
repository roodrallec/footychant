import React, {useState} from "react"
import {useCombobox} from "downshift"
import Box from "@material-ui/core/Box"
import Input from "@material-ui/core/Input"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import Typography from "@material-ui/core/Typography"

export function DropdownCombobox({items, onChange}) {
  const [inputItems, setInputItems] = useState(items)
  const itemToString = (team) => team ? team.name : ''
  const {
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
    <Box>
      <Typography variant='h5' {...getLabelProps()}>Choose your team</Typography>
      <div {...getComboboxProps()}>
        <Input placeholder='Type to search' style={{width:"100%"}} {...getInputProps({refKey: 'inputRef'})} />
      </div>
      <List className={"team-list"} {...getMenuProps()}>
        {inputItems.map((item, index) => (
          <ListItem
            className={highlightedIndex === index ? "highlighted" : ""}
            key={`${item.name}${index}`}
            {...getItemProps({item, index})}
          >
            <img style={ { width: "1em", height: "1em" }} src={item.country.icon} alt={`${item.country.name}'s flag`} />{item.name}
          </ListItem>
        ))}
      </List>
    </Box>
  )
}
