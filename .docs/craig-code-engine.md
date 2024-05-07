# CRAIG in IBM Code Engine

The default setup of CRAIG in Code Engine pulls the latest CRAIG source, builds a container image, and creates the serverless application. All of this activity is done in a Code Engine project. The default CRAIG Code Engine project looks like this:

![craig-ce-project](images/craig-ce-project.png)

## Updating CRAIG
CRAIG is continually being enhanced with new features. To update your CRAIG deployment with the latest CRAIG code level, navigate to the `craig` project's image build. The navigation flow from the [Code Engine project page](https://cloud.ibm.com/codeengine/projects) is:
1. Click on the `craig` project name
2. Click `Image builds` on the left panel
3. Click the `Image build` tab in the main panel
4. Click the `imgbld-craig` build name

The image build panel looks like this:
![craig-ce-image-build](images/craig-ce-imgbld.png)

To refresh the container image with the latest code, click the `Submit build` button and then the `Submit build` button on the right nav pop-over.

This will build a new container image with the latest CRAIG source. The next time the CRAIG application starts after a period of inactivity, it will use the new image.

### Redeploying the CRAIG instance
The new instance can also be deployed immediately by navigating to the `craig` application panel and clicking the `Redeploy` button.

The `craig` application panel can be reached from the `craig` project by clicking on the `Applications` left menu item and clicking the on the `craig` application name in the table. The application panel looks like this:

![craig-application-panel](images/craig-application-panel.png)

## Advanced source and container image management
The Code Engine image build and application settings can be used to manage the CRAIG source level being built and run.

* The `Branch name` field on the image build panel can be changed to build a specific CRAIG tag/release or a specific commit level.
* The output tab of the image build panel can be used to change the output container image name and tag. The image name and tag can also be set during image build submission. The container image tags can be changed from `latest` to something else like the CRAIG source image tag or the date the latest `main` branch was pulled and built.
* If different image container names or tags are used, the `Image reference` field on the `craig` application panel must be updated with the new image/tag name and the revision [redeployed](#redeploying-the-craig-instance) to run with the new image.

## Bring your own Power VS workspace

For more information on how to bring your own Power VS workspaces to CRAIG, refer to our [power-vs-workspace-deployment.md](./power-vs-workspace-deployment.md) documentation.
