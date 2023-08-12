import React, { FormEvent } from "react";

export default function Profile() {

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    console.log(e.target)
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <button className="p-6 bg-blue-500"> submit </button>
        <button type="button" className="p-6 bg-red-500"> cancel </button>
      </form>
    </>
  )
}
