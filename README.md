# Automated backup application (Binary Coffee)

## Scripts description

- `setup-store.js`: The script has the responsibility to create the needed buckets in Google Storage API.
There is a list in the script that the user can modify and all the needed buckets will be created on his own Google Storage service.
- `compress-files.js`: With this script is possible to compress files and directories and copy those *.zip* files to the folder `compress_files`.
- `upload.js`: After the `.zip` files are created, with the defined structure, the latest version of those files are uploaded to Google Storage, depending on who bucket it belongs.
- `main.js`: Its the script that automatically, depending of the fixed time, executes the previous script, and saves the latest information of the database.

## What data is saved?

Binary Coffee API application is using the framework [strapi.io](strapi.io). This framework organizes the information in two ways:

1. Database information
2. Static files, like images.

All the previous information is saved on independents volumes in the hosting, and it's easy to share these volumes between those Docker containers and the container of the current application.
So, this means that the data saved in Google Storage is all the images that the application contains, and the daily backups of the database.

## How can I reuse the code?

Well, in order to reuse the code, you need to adapt the scripts to your Business Logic, and use your personal store-key.json (generate from google API) that allow you to interact with your Google Storage session.

## Environment variables

Currently, the only environment variables in use, are when the user starts the application with Docker. Those variables are:

- `EXTERNAL_IMAGES_PATH`: route to the external directory where the images to save are.
- `EXTERNAL_BACKUPS_PATH`: route to the folder where the DB backups are.
- `EXTERNAL_COMPRESS_FILES_PATH`: route where the `.zip` files are going to be saved.

## Start current application

**Locally**

```
npm start
```

**Docker**

```
docker-compose up -d
```

## Dependencies

- `@google-cloud/storage`: Google Storage API framework for NodeJS
- `archiver`: Dependency for compress files and directories
- `node-cron`: Library for manage cronjob tasks in NodeJS

## Contributions

All contributions are welcome
