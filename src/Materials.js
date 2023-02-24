import React from "react";
import { nanoid } from "nanoid";


export default function Materials(props) {
    const options = props.materials.map(item => {
      return (
        <option key={nanoid()} value={item.name}>{item.name}</option>
      )
    })
    return (
      <>
        <label htmlFor="materials">Выберите материал:</label>
        <select id="materials" name="materials" value={props.currMaterial} onChange={(e) => {props.handler(e)}}>
          {options}
        </select>
      </>
    )
  }