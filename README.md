# Configure the app
In `startup_script.sh` update `environment` variables like expected.
- Set `NODE_ENV` to `production` or anything else but `your-environment` if you want to run the app outside Google Cloud Platform (See https://github.com/GoogleCloudPlatform/google-cloud-node#elsewhere)
If `NODE_ENV` is set to `production`, the you don't need to set `GCLOUD_PROJECT` and `GCLOUD_KEY_FILENAME`

- Set `GCLOUD_TOPIC` and `GCLOUD_SUBSCRIPTION` accordingly.

# Deploy / Teardown

- Run `. deploy_single.sh` or `. deploy.sh` depending if you need a single instance or not.
- Run `. teardown_single.sh` or `. teardown.sh` accordingly.