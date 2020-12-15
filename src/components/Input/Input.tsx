import React from "react";

interface Props {
  value: string
  onChange: (value: string) => void
}

export default function Input(props: Props) {
  function onChange(event) {
    console.log(event)
  }

  return (
    <>
      <input value={props.value} onChange={onChange}/>
    </>
  )
}