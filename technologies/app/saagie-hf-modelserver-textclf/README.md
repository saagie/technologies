## How to launch Saagie HF ModelServer TextCLF?

To make Saagie HF ModelServer TextCLF work on your platform, there are no special steps to take.

The Saagie HF ModelServer TextCLF app can be used both as an app and via the API.

### Using Saagie Hugging Face Model Server as an app

1. Click **Install** to install your app.
2. Open your app interface by clicking **Open** on your app card. 
<br>The Saagie HF ModelServer TextCLF app opens in a new tab.
3. Fill in the fields according to your needs.
   1. In the `Model Name` field, enter the repository name of the Hugging Face model you want to deploy. You can select it from the <a href="https://huggingface.co/models?pipeline_tag=text-classification&sort=trending" target="_blank">Text Classification</a> list.
   2. In the `Label` field, specify the output labels of the model.
   3. Click **\[Deploy]** and wait for loading to finish.
   4. Enter your text in the `Text Classification` field to predict it. Each line break indicates the beginning of a new sentence, and thus a new prediction.
   5. Click **\[Predict]** to get the prediction results.

***
> _For more information, see our documentation on how to <a href="https://docs.saagie.io/user/latest/data-team/add-on-module/saagie-hugging-face/saagie-hugging-face-use-app" target="_blank">use Saagie Hugging Face Model Server as an app</a>._

### Using Saagie Hugging Face Model Server via API

1. Click **Install** to install your app.
2. On your Saagie platform, create the following <a href="https://docs.saagie.io/user/latest/data-team/projects-module/projects/managing-environment-variables#creating-environment-variables" target="_blank">environment variable</a>:

   | Name       | Value                                                                                                                                                        | 
   |------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
   | `$SHF_API` | This is the URL of the Saagie model deployer, `http://app-<YOUR_APP_ID>:8080`. Where the value for `<YOUR_APP_ID>` can be found in the URL of your app page. |
3. Create a new job in Bash, for example, and make a `curl` query to deploy and predict your text. Your code must include the environment variable created earlier.
<br> _Here is an example of a `curl` query to deploy and predict a text:_
   ```bash
   MODEL='j-hartmann/emotion-english-distilroberta-base:main'
   LABEL='anger|disgust|fear|joy|neutral|sadness|surprise'
   curl -H "Accept: application/json" -H "Content-type: application/json" -X POST -d\'{"model_dir":"'$MODEL'", "label":"'$LABEL'"}' $SHF_API"/deploy"
   curl -H "Accept: application/json" -H "Content-type: application/json" -X POST -d\'{"inputs":["Good Movie, best of the year", "Highly recommended","very bad", "worst movie"]}' $SHF_API"/predict"
   ```

***
> _For more information, see our documentation on how to <a href="https://docs.saagie.io/user/latest/data-team/add-on-module/saagie-hugging-face/saagie-hugging-face-use-api" target="_blank">use Saagie Hugging Face Model Server via API</a>._