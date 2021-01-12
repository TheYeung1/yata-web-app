import { CreateItem } from "../YataClient";
import React, { useState } from "react";
import "./createListItem.css";

const CONTENT_HINT = {
  EMPTY: {
    style: "help",
    text: "Type in a new item between 0 and 100 characters",
  },
  TOO_LONG: {
    style: "help is-danger",
    text: "New item must be less than 100 characters",
  },
  VALID: {
    style: "help is-success",
    text: "Press enter to create a new item",
  },
};

const DEFAULT_FORM_STATE = {
  newItem: "",
  hint: CONTENT_HINT.EMPTY,
  valid: false,
  error: null,
};

function CreateListItemForm(props) {
  const [formState, setFormState] = useState(DEFAULT_FORM_STATE);

  function handleNewItemChanged(event) {
    const newItem = event.target.value;
    const isItemValid = newItem.length > 0 && newItem.length <= 100;
    let itemHint;
    if (newItem.length > 100) {
      itemHint = CONTENT_HINT.TOO_LONG;
    } else if (newItem.length === 0) {
      itemHint = CONTENT_HINT.EMPTY;
    } else {
      itemHint = CONTENT_HINT.VALID;
    }
    setFormState({
      ...formState,
      newItem: newItem,
      hint: itemHint,
      valid: isItemValid,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!formState.valid) {
      return;
    }
    CreateItem(props.listId, formState.newItem)
      .then((data) => {
        props.onSuccess(data.ItemID, formState.newItem);
        clearForm();
      })
      .catch((error) => {
        setFormState({
          ...formState,
          error: error,
        });
      });
  }

  function clearForm() {
    setFormState(DEFAULT_FORM_STATE);
  }

  return (
    <form onSubmit={handleSubmit} data-testid="createItemForm">
      <input
        id="newListItemInput"
        className="input list-item-input"
        type="text"
        placeholder="Create a new item"
        value={formState.newItem}
        onChange={handleNewItemChanged}
      ></input>
      <p className={formState.hint.style}>{formState.hint.text}</p>
      {formState.error && (
        <p className="help is-danger">
          Error {formState.error.name}: {formState.error.message}
        </p>
      )}
    </form>
  );
}

export default CreateListItemForm;
