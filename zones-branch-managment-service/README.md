#Technical Information

# Download

To use the zones-usermanagement-serve for your project, download the latest version from [here](https://github.com/sysgain/zones-usermanagement-serve/tree/ownership-serve)

# zones-usermanagement-serve Microservices


2. Add Auth0 client ID , Secret , management Api client, managment Api secret [here](https://github.com/sysgain/zones-usermanagement-serve/blob/ownership-serve/config/config.js). 
      
      OR 
  
  You can pass the these value from environment vars.

  > auth0Secret 
  > auth0ClientID
  > auth0ManageSecret
  > auth0ManageClientID

3. db host has intialized with  "localhost" which in zonestrails docker account find the referance here [here](https://github.com/sysgain/zones-usermanagement-serve/blob/ownership-serve/config/config.js). 




# Swagger File to quick look at routes
* [__configured swagger.yml__](https://github.com/sysgain/zones-usermanagement-serve/blob/ownership-serve/api/swagger/swagger.yaml) - Swagger routes and Definitions

# Contributions

* Incase of errors or issues or feature requests report [here](https://github.com/umar4sap/zones-usermanagement-serve/issues)
* Incase of contributions fork and create a pull request.


# Functional Information:

1.The Auth0 users should need below as the basic structure in his app_metadata to perform tenant managment operation
>{
  "permissions": {
    "ownerships": [
      {
        "ownershipName": {
          "branchs": [
            {
              "branch": "personel",
              "role": "admin"
            }
          ]
        }
      }
    ]
  }
>}

<!-- #Rules
OwnershipANIZATIONS:

![create ownerships](https://github.com/sysgain/zones-usermanagement-serve/blob/ownership-serve/img/delete-read-ownership.png)

branchS:

![create branch](https://github.com/sysgain/zones-usermanagement-serve/blob/ownership-serve/img/create%20branch.png) -->


