import * as YataClient from "../YataCLient";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import CreateListItemForm from "./CreateListItemForm";

beforeEach(() => {
  YataClient.CreateItem = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

test("Create New Item Successful", async () => {
  const listId = "7fff6926-a039-4f39-a5a7-bcec65574627";
  const newItemId = "05937447-82dd-4463-b4b9-45b0bcb7a1af";
  const newItemContent = "Buy milk";
  YataClient.CreateItem.mockImplementation((listId, itemContent) => {
    return Promise.resolve({ ItemID: newItemId });
  });

  const onNewItem = jest.fn();
  render(<CreateListItemForm listId={listId} onSuccess={onNewItem} />);

  const createItemInput = screen.getByPlaceholderText("Create a new item");
  expect(createItemInput).toBeInTheDocument();

  const createItemHint = screen.getByText(
    "Type in a new item between 0 and 100 characters"
  );
  expect(createItemHint).toBeInTheDocument();

  fireEvent.change(createItemInput, {
    target: { value: newItemContent },
  });
  expect(createItemInput.value).toBe(newItemContent);
  expect(createItemHint.textContent).toBe("Press enter to create a new item");

  fireEvent.submit(screen.getByTestId("createItemForm"));

  await waitFor(() =>
    expect(onNewItem).toHaveBeenCalledWith(newItemId, newItemContent)
  );
});

test("Create New List Input Too Long", async () => {
  const listId = "7fff6926-a039-4f39-a5a7-bcec65574627";

  const onNewItem = jest.fn();
  render(<CreateListItemForm listId={listId} onSuccess={onNewItem} />);

  let newItem;
  for (let i = 0; i < 101; i++) {
    newItem += "a";
  }
  const createItemInput = screen.getByPlaceholderText("Create a new item");
  fireEvent.change(createItemInput, {
    target: { value: newItem },
  });

  expect(createItemInput.value).toBe(newItem);
  const createItemHint = screen.getByText(
    "New item must be less than 100 characters"
  );
  expect(createItemHint).toBeInTheDocument();

  fireEvent.submit(screen.getByTestId("createItemForm"));

  expect(onNewItem).not.toHaveBeenCalled();
});

test("Yata API throws error", async () => {
  const listId = "7fff6926-a039-4f39-a5a7-bcec65574627";
  const newItemContent = "Buy milk";
  YataClient.CreateItem.mockImplementation((listId, itemContent) => {
    return Promise.reject(
      new YataClient.HttpResponseError("GenericYataError", "This is bad...")
    );
  });

  const onNewItem = jest.fn();
  render(<CreateListItemForm listId={listId} onSuccess={onNewItem} />);

  const createItemInput = screen.getByPlaceholderText("Create a new item");
  expect(createItemInput).toBeInTheDocument();

  fireEvent.change(createItemInput, {
    target: { value: newItemContent },
  });

  fireEvent.submit(screen.getByTestId("createItemForm"));

  await waitFor(() => {
    expect(YataClient.CreateItem).toHaveBeenCalled();
  });

  const errorMsg = screen.getByText("Error GenericYataError: This is bad...");
  expect(errorMsg).toBeInTheDocument();
});
