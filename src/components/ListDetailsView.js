import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DescribeList, GetItems } from "../YataClient";
import CreateListItemForm from "./CreateListItemFormWithReduce";

/**
 * ListDetailsView is the view which shows the details for a list and all its items
 */
function ListDetailsView() {
  let { id } = useParams();

  const [listState, setListState] = useState({
    details: null,
    loading: true,
    error: null,
  });
  const [itemsState, setItemsState] = useState({
    items: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    GetItems(id)
      .then((data) => {
        setItemsState({
          items: data.Items,
          loading: false,
          error: null,
        });
      })
      .catch((error) => {
        console.error("Error getting items ", error);
        setItemsState({
          items: null,
          loading: false,
          error: { code: error.name, message: error.message },
        });
      });

    DescribeList(id)
      .then((data) => {
        setListState({
          details: data.List,
          loading: false,
          error: null,
        });
      })
      .catch((error) => {
        console.error("Error describing list ", error);
        setListState({
          details: null,
          loading: false,
          error: { code: error.name, message: error.message },
        });
      });
  }, [id]);

  //TODO: error
  if (listState.error !== null) {
    return renderError(listState.error);
  }

  if (itemsState.error !== null) {
    return renderError(itemsState.error);
  }

  let content;
  if (itemsState.loading || listState.loading) {
    content = <div className="content">Loading...</div>;
  } else {
    const onNewItem = (itemId, content) => {
      setItemsState({
        ...itemsState,
        items: [
          { ListID: id, ItemID: itemId, Content: content },
          ...itemsState.items,
        ],
      });
    };

    content = (
      <div className="content">
        <ListDetails list={listState.details} loading={listState.loading} />
        <ListItems
          listId={id}
          items={itemsState.items}
          loading={itemsState.loading}
          onNewItem={onNewItem}
        />
      </div>
    );
  }

  return (
    <section className="section">
      <div className="container">{content}</div>
    </section>
  );
}

function renderError(error) {
  return (
    <div>
      <h1 class="title">Sorry! Something went wrong</h1>
      <p>
        Error {error.code}: {error.message}
      </p>
    </div>
  );
}

function ListDetails(props) {
  return <h1 class="title">{props.list.Title}</h1>;
}

function ListItems(props) {
  const content = props.items.map((item) => (
    <li key={item.ItemID}>{item.Content}</li>
  ));

  return (
    <ul>
      <li>
        <CreateListItemForm listId={props.listId} onSuccess={props.onNewItem} />
      </li>
      {content}
    </ul>
  );
}

export default ListDetailsView;
