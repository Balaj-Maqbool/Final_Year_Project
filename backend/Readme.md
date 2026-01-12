# Things that i learned

- import DB_NAME from"./constants.js"// when export default
- import {DB_NAME} from "./constants.js" //when direct export

- always export (direct or default ) If you want to use some variable or anything from other files

## In JavaScript ES modules:

- To share a variable, function, or object from one file to another, you must export it.
- Then in the other file, you import it.

## new and this

- new only works for classical function(){}
- this works for arrow ()=>{} , but only for one instance, so not recommended to use in arrow functions
- this refers to the thing it was called by

## call & bind

- you can pass this (context) of parent function to its child function bu using .call(context, arg1,agr2 ...) method
- the child or inner function will change the context (this) of parent or outer function

## jwt (json web token)

- is a bearer token
- the one who bears it is always legit and correct requester
- acts like a key to get the data from the DB

## HTTP process

Basic Flow:

Client Sends HTTP Request
Server Processes Request
Server Sends HTTP Response
Client Handles the Response

## HTTP status codes

HTTP response status codes indicate whether a specific HTTP request has been successfully completed. Responses are grouped in five classes:

Informational responses (100 – 199)
Successful responses (200 – 299)
Redirection messages (300 – 399)
Client error responses (400 – 499)
Server error responses (500 – 599)

## Steps to Register a User

| Step | Description                                 |
| ---- | ------------------------------------------- |
| 1    | Client sends POST `/register`               |
| 2    | Parse JSON body                             |
| 3    | Validate required fields                    |
| 4    | Check if user already exists                |
| 5    | Hash password using bcrypt                  |
| 6    | Save user to MongoDB                        |
| 7    | Create JWT token                            |
| 8    | Send back JSON response (optionally cookie) |
| 9    | Redirect or navigate user (frontend)        |
