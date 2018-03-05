# Download

To use the seed for your project, download the latest version from [here](https://github.com/sysgain/Seed-MicroService/tags)

# pre req

Install `npm install -g swagger`

# Micro Servcie Seed Project

1. Change the logger name [here](https://github.com/sysgain/Seed-MicroService/blob/master/app.js#L11).
2. Add Auth0 client ID & Secret [here](https://github.com/sysgain/Seed-MicroService/blob/master/config/config.js#L6).
3. Add the docker repo name and tag [here](https://github.com/sysgain/Seed-MicroService/blob/master/stack.yml#L2).
4. Change the folder name "sysgain-microservice-seed" to Microservice Name [here](https://github.com/sysgain/Seed-MicroService/blob/master/Dockerfile#L4).
5. Put your controllers [here](https://github.com/sysgain/Seed-MicroService/tree/master/api/controllers).
6. `npm install` to install dependancies.
7. Use `swagger project edit` to start swagger editor from terminal | bash.
8. Use `swagegr project start` to start the service from terminal | bash.

# Publishing API behind Azure API Gateway 

see video [here](https://sysgain365.sharepoint.com/portals/hub/_layouts/15/VideoEmbedHost.aspx?chId=02ae9c4e%2D71ec%2D4e21%2D988d%2Dc221d9575ea3&amp;vId=bbba25f1%2D6674%2D47fa%2D93ad%2Dfd43a89ac534&amp;)

# Important Files to look at

* [__Dockerfile__](https://github.com/sysgain/Seed-MicroService/blob/master/Dockerfile) - Used to build docker image.
* [__App.js__](https://github.com/sysgain/Seed-MicroService/blob/master/app.js) - Application bootstrapper.
* [__Stack.yml__](https://github.com/sysgain/Seed-MicroService/blob/master/stack.yml) - Used by docker cloud (previosuly known as docker compose)
* [__swagger.yml__](https://github.com/sysgain/Seed-MicroService/blob/master/api/swagger/swagger.yaml) - Swagger Definitions

# Contributions

* Incase of errors or issues or feature requests report [here](https://github.com/sysgain/Seed-MicroService/issues)
* Incase of contributions fork and create a pull request.
