# Backend Developer Technical Test
Hi There

Please see the technical test repo

### Endpoints Implemented

- `POST /:group/:id`

 {
            "id": "e335175a-eace-4a74-b99c-c6466b6afadd",   // echoed from path parameter
            "group": "particle-detector",                   // echoed from path parameter
            "createdAt": 1571418096158,                     // first registered heartbeat
            "updatedAt": 1571418124127,                     // last registered heartbeat
 }
 - `DELETE /:group/:id`

    - unregisters an application instance

- `GET /`

    - returns a JSON array containing a summary of all currently registered groups as follows:

        ```js
        [
            {
                "group": "particle-detector",
                "instances": "4",               // the number of registered instances in this group
                "createdAt": 1571418124127,     // first heartbeat registered in this group
                "lastUpdatedAt": 1571418124127, // last heartbeat registered in this group
            },
            // ...
        ]
        ```

    - groups containing 0 instances should not be returned

- `GET /:group`

    - returns a JSON array describing instances of the `group`:

        ```js
        [
            {
                "id": "e335175a-eace-4a74-b99c-c6466b6afadd",
                "group": "particle-detector",
                "createdAt": 1571418096158,
                "updatedAt": 1571418124127,
            },
            // ...
        ]
        ```
        
### How to run the application

Pull down the code & run the application using npm run start

Please execute the tests using the following Command : npm run test