# NEWUSER SERVICE
    This service contains end points to manage auth0 Management API's. 

# Installation
    Install node modules using `npm install`

# Usage
    1. Set the environment variables for the service.
        - AUTH0_CLIENT_ID - Auth0 Details
        - AUTH0_DOMAIN - Auth0 Details
        - AUTH0_CLIENT_SECRET - Auth0 Details
        - PORT - Port on which project-service should run.
    2. The endpoints and the inputs/outputs to be provided to them are available in "./api/swagger/swagger.yaml".
    
# AUTH0-SERVICE DEPENDS ON
    1. This service has following dependencies, so they must be running:
        - Auth0 Management Api v2  

# Newuser-SERVICE NEEDED BY
	1. UI CLient

# Business Logic
    1. To create Manager/Gym owner
        a. Creates a user in Auth0 as a part of Manager/Gym owner onboarding.
    
    2. To update a User/Publisher
        a. You can update a User/Publisher by supplying it with user id and the changes to be updated in the account.

    3. To Check Existing Username
        a. Checks for an existing user with the same username.
        
    4. To Check Existing User Email
        a. Checks for an existing user with the same email. 

# TO-DO ITEMS:
	1. Review Error Handling
	2. Write Unit Test Cases
