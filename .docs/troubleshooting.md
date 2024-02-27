# Troubleshooting
## CRAIG-generated Terraform is unable to create an Activity Tracker target
When creating an Activity Tracker target with a public endpoint, you may see this error when attempting to apply your Terraform configuration, even if your Activity Tracker instance is set to public:
```
Error: CreateTargetWithContext failed Your account has the API public endpoint disabled. Try again by using the private endpoint.
```
This error is caused by a setting in your IBM Cloud Account that only allows private endpoints for Activity Tracker instances. You can rectify this issue by accessing the [IBM Cloud Shell](https://cloud.ibm.com/docs/cloud-shell?topic=cloud-shell-getting-started) and enabling public endpoints with the following command:
```
ibmcloud atracker setting update --private-api-endpoint-only FALSE
```
After enabling public endpoints on your account, your Terraform configuration should be able to create an Activity Tracker target successfully.