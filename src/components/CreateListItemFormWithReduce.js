import { CreateItem } from "../YataClient";
import React, { useReducer } from "react";
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

function onNewItemInputChanged(state, itemInput) {
  const isItemValid = itemInput.length > 0 && itemInput.length <= 100;
  let itemHint;
  if (itemInput.length > 100) {
    itemHint = CONTENT_HINT.TOO_LONG;
  } else if (itemInput.length === 0) {
    itemHint = CONTENT_HINT.EMPTY;
  } else {
    itemHint = CONTENT_HINT.VALID;
  }
  return {
    ...state,
    newItem: itemInput,
    hint: itemHint,
    valid: isItemValid,
  };
}

function getReducer(props) {
  return (state, action) => {
    switch (action.type) {
      case "inputUpdated":
        return onNewItemInputChanged(state, action.newListContent);
      case "submitFormSuccess":
        return DEFAULT_FORM_STATE;
      case "submitFormFailure":
        return {
          ...state,
          error: action.error,
        };
      default:
        return state;
    }
  };
}

function CreateListItemForm(props) {
  const [state, dispatch] = useReducer(getReducer(props), DEFAULT_FORM_STATE);

  function submitForm(event) {
    event.preventDefault();
    if (!state.valid) {
      return;
    }
    CreateItem(props.listId, state.newItem)
      .then((data) => {
        props.onSuccess(data.ItemID, state.newItem);
        dispatch({ type: "submitFormSuccess" });
      })
      .catch((err) => {
        dispatch({ type: "submitFormFailure", error: err });
      });
  }

  return (
    <form onSubmit={submitForm} data-testid="createItemForm">
      <input
        id="newListItemInput"
        className="input list-item-input"
        type="text"
        placeholder="Create a new item"
        value={state.newItem}
        onChange={(event) =>
          dispatch({ type: "inputUpdated", newListContent: event.target.value })
        }
      ></input>
      <p className={state.hint.style}>{state.hint.text}</p>
      {state.error && (
        <p className="help is-danger">
          Error {state.error.name}: {state.error.message}
        </p>
      )}
    </form>
  );
}

export default CreateListItemForm;
