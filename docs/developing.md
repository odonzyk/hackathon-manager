# Developing

To start, clone the repo (for more instruction see [here](cloning-the-repo)) and create a new branch! 

## Setup the project
To run the project locally, follow these steps:

1. **Clone the Repository**  
   - Check out the project from the repository.
2. **Start the Backend**  
   - Configure the backend  
   - Install dependencies  
   - Start the backend  
3. **Start the Frontend**  
   - Configure the frontend  
   - Install dependencies  
   - Start the frontend  
   - Access the application  
4. **Additional Information**  
   - Perform a health check  
   - View API documentation  

Consider the [Branching-Conventions](#branching-conventions), [Commit-Conventions](#commit-conventions) and more! 

### Clone the Repository ###
If you want use http to clone, you first need to create an access token first.
Link to create a Access Token -> https://gitlab-ext.drsbln.de/-/user_settings/personal_access_tokens


If you have created a personal "Access Token" in you're Gitlab Server User Profile, you can use it like:
```sh
git clone https://<Youre_Login_Name>:<youre gitlab-token>@gitlab-ext.drsbln.de/developer/parking.git
```

### Start the Backend ###
#### Configure the backend ####

First, a configuration file for the development environment needs to be created.

```sh
cd backend
cp env.example env.dev
```
if necessary, you can adjust the values in the configuration file to meet your specific requirements.

#### Install dependencies ####

All required dependencies for the project must be installed.
```sh
npm install
```

#### Start the backend  ####
Now, you can start the backend.

On the first run, the database will be automatically created and initialized.

```sh
npm run start-dev 
```

#### Verify That the Backend is Running ####

You can check if the backend is running by accessing the following endpoints:

* **Health Check**: http://localhost:3000/api/health
* **API Documentation (Swagger)**: http://localhost:3000/api-docs

### Start the Frontend ####
First, a configuration file for the development environment needs to be created.

```sh
cd frontend
cp env.example env.dev
```
if necessary, you can adjust the values in the configuration file to meet your specific requirements.

#### Install dependencies ####

All required dependencies for the project must be installed.
```sh
npm install
```

#### Start the frontend  ####
Now, you can start the frontend.

```sh
npm run start-dev 
```

####  Access the application #### 

Open the Parking App in your browser 

==> http://localhost:8100

First login with default credentials

    User: admin@parking.de
    Password: 1234

# Architecture
## API 
The REST API is automatically documented with Swagger. After starting it, it is available at
http://localhost:3000/api-docs

## Monitoring 
For an simple healthcheck you can check http://localhost:3000/api/health 

For more detailed analytic you can use prometheus and collect the API measurements under http://localhost:3000/metrics

## DB Structure

 <img src="./db_structure.png" alt="db structure" width="600" height= "600"/>

See [DB Docs](./db.md) for more infos!

## Architecture graphics

Link: https://miro.com/app/board/uXjVLwYlFMI=/?share_link_id=640050306327  
Password is pinned in the privat slack channel "#parking"

## Test and Deploy with docker
Please do not delete this Folder!
For usage of Docker there is a Folder with a draft configuration-set for docker, docker-compose and traffic with LetsEncrypt. These folder is necessary to prepare a local environment with LetsEncrypt and reverse proxy like traffic.

Or the folder is also used to configure a production Server and the environment to run the app with according DNS and LetsEncrypt Certificate.

# Conventions

## PreCommit Tasks

### Backend
```sh
npm test
npm format
```

### Frontend
```sh
npm test
npm test.e2e
npm eslint
npm format
```


## GIT Branches
### Main-Branches:

- **`main`**: This branch should only contain **production-ready code**. It should only include **clean, complete, stable and well tested** code. Changes should only come from clean Pull Requests (PRs) from the `develop` branch. The changes should be merged, when they are thoroughly tested and reviewed by other.
- **`develop`**: The Integration-Branch, on which new features and bugfixes are committed before they are merged into the `main` Branch. When the changes are committed, the **Staging** process will begin with testing and integration. The Code doesn't need to be complete but should work!

### Short-Lived Branches:

- **`feature/`**: Branches for features with specific category! They should be named according to the feature e.g. `feature/add-parking-reservation`. Multiple Developers and people should be able to work on the same feature.
- **`bugfix/`**: Branches for bugfixes. E.g. `bugfix/fix-login-error`.
- **`experimental/`**: Branches for experimental features or for trying-out new technologies, which are not stable, have unfinished requirements or wether it is unclear if it should be used! E.g. `experimental/try-new-dark-theme`.


### Commit Conventions

To keep things more organized, we recommend using following prefixes:

- **`feat:`** for new features (e.g. `feat: Add user authentication module`)
- **`fix:`** for bug fixes (e.g. `fix: Resolve login error`)
- **`chore:`** for small things(e.g. `chore: Update README with new setup instructions`)s

