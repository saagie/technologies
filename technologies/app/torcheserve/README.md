# Torchserve - customized by Saagie

- **TorchServe's goal** is to deploy models and perform *inference*, not for training.
- **Use case:** 
We run TorchServe through a Docker App on Saagie, use curl to post models from HDFS or S3 to the App. 
So the users could use these models to inference through other app/curl.
- **Future works:**
A GUI will greatly simplify and visualize the curl operations. Using Dash could make GUI for flask app and produce demos for our new models.


## 🏃‍ Quick Start: Using pretrained models from S3:
#### Step 1. Check Status
 
After deployed the docker image explosing ports 8079, 8080, 8081 (respectively for flask app, torchserve inference and torchserve configuration). Check the TorchServe status:
```bash
echo "------STATUS CHECK (8080)-------"
curl -k $APP_URL/8080/ping
```
should have results
```json
{
  "status": "Healthy"
}
```


#### Step 2. Add model from S3 and check
```bash
echo "------ADD .mar MODELS FROM S3 (8081)------"
curl -k -X POST $APP_URL/8081/models?url=https://mar-files.s3.eu-west-3.amazonaws.com/mnist.mar

echo "------SHOW MODELS (8081)------"
curl -k $APP_URL/8081/models
```
should have results
```json
------ADD .mar MODELS FROM S3 (8081)------
{
  "status": "Model \"mnist\" Version: 1.0 registered with 1 initial workers"
}
------SHOW MODELS (8081)------
{
  "models": [
    {
      "modelName": "mnist",
      "modelUrl": "https://mar-files.s3.eu-west-3.amazonaws.com/mnist.mar"
    }
  ]
}
```


#### Step 3. Configure the model and predict image
```bash
echo "------DESCRIBE MODEL (8081-Densenet)------"
curl -k -X PUT $APP_URL"/8081/models/densenet161?batch_size=1&min_worker=1&max_worker=4"
curl -k $APP_URL/8081/models/densenet161

echo "------INFERENCE (8080-Densenet)------"
curl -k -O https://s3.amazonaws.com/model-server/inputs/kitten.jpg
curl -k -X POST $APP_URL/8080/predictions/densenet161 -T kitten.jpg
```
should have results
```json
------DESCRIBE MODEL (8081-Densenet)------
{
  "status": "Processing worker updates..."
}
------INFERENCE (8080-Densenet)------
[
  {
    "tiger_cat": 0.4693359136581421
  },
  {
    "tabby": 0.4633873701095581
  },
  {
    "Egyptian_cat": 0.06456154584884644
  },
  {
    "lynx": 0.001282821292988956
  },
  {
    "plastic_bag": 0.00023323031200561672
  }
]
```
#### Finished!!


## 📇 Customize your deep model (Optional):
#### Step 1. Prepare files
When deploying a customized model, **at least 3 files** should be submitted by curl:
- **params.pt** — the trained parameters
- **model.py** — contains a class to declare the model structure
- **handler.py** — contains a default handle() function + a class for handling the service

The following page is an official reference, where *mnist.py*, *mnist_cnn.pt*, *mnist_handler.py* are necessary: 

https://github.com/pytorch/serve/tree/master/examples/image_classifier/mnist


#### Step 2. Upload to HDFS
Please upload them to **the same directory** on HDFS, for example:
- /my_path/my_model_mnist/handler.py
- /my_path/my_model_mnist/model.py
- /my_path/my_model_mnist/params.pt


#### Step 3. Interact via curl
If you have *params.pt*, *model.py*, *handler.py* in the same folder, you just need to fill the *model name* and *folder path* your want to call and the path of HDFS:
```bash
MODEL=# Fill with model name, no need of "", just text, such as Zelda_Monster_CLF
echo "------TorchServe(8081) -> UNregister the ancient model------"
curl -k -X DELETE $APP_URL/8081/models/$MODEL

echo "------Flask(8079) -> Add customized model from HDFS------"
curl -k -H "Content-Type: application/json" -X POST -d '{"hdfs_uri":"xxxxxxxx TO FILL xxxxxxxx", "model_name":"'$MODEL'","folder_path":"xxxxxxxx TO FILL xxxxxxxx"}' $APP_URL/8079/config

echo "------TorchServe(8081) -> Active the model, configure workers------"
curl -k -X POST $APP_URL"/8081/models?url=$MODEL.mar"
curl -k -X PUT $APP_URL"/8081/models/$MODEL?batch_size=4&min_worker=1&max_worker=4"
```
Then it will work in the same way as the models input from S3.


#### 🐞 Debugging:
When bash job doesn't work, the error logs would be **printed in the log of Docker App** (TorchServe Launcher), you can find the error message in its final lines.


