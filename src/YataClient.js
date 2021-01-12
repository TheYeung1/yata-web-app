import { v4 as uuid } from "uuid";

let jwt = null;
export function setAuthToken(token) {
  jwt = token;
}

export async function CreateItem(listID, content) {
  const request = { ListID: listID, ItemID: uuid(), Content: content };
  return call("/lists/" + listID + "/items", "PUT", request);
}

export async function GetItems(listID) {
  return call("/lists/" + listID + "/items", "GET", null);
}

export async function CreateList(title) {
  const request = { ListID: uuid(), Title: title };
  console.log("Creating new list: ", request);
  return call("/lists", "PUT", request);
}

export async function GetLists() {
  return call("/lists", "GET", null);
}

export async function DescribeList(listID) {
  return call("/lists/" + listID + "/", "GET", null);
}

async function call(endpoint, method, data) {
  return fetch(endpoint, {
    method: method,
    headers: {
      Authorization: getAuthHeader(),
    },
    body: data === null ? null : JSON.stringify(data),
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    // TODO: decode the body as json and then use Code and Message from error struct
    throw new HttpResponseError(response.status, response.statusText);
  });
}

function getAuthHeader() {
  if (jwt === null) {
    throw new HttpResponseError(
      new Response(new Blob(), {
        status: 403,
        statusText: "User is not authenticated",
      })
    );
  }
  return "Bearer " + jwt;
}

export class HttpResponseError extends Error {
  constructor(code, message) {
    super(message);
    this.name = code;
    this.message = message;
  }
}
