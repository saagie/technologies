# Saagie-HF-ModelServer-TextCLF


## Description
Saagie-HF-ModelServer-TextCLF: Custom app based on Dash/Flask that deploys the deep learning models from HuggingFace and makes predictions via the GUI or API. 


## How to use
To deploy the app: you need to create the app with port `8080` exposed, `Base path variable:SAAGIE_BASE_PATH`, don't select `Use rewrite url` and set the port access as `PROJECT`. 

Once the app is up, you can open the page of port 8080, enter a model for text classification on Hugging Face in `Model Name` on the left, then enter the corresponding `Label` and click `Deploy`.

When the model is successfully deployed, you can enter the sentences to be predicted in `Text Classification` on the right side, the sentences will be split with line breaks. Then click `Predict` to get the predicted results.

> An example is: 
> 
> Model Name:j-hartmann/emotion-english-distilroberta-base
> 
> Label: anger 🤬 | disgust 🤢 | fear 😨 | joy 😀 | neutral 😐 | sadness 😭 | surprise 😲 



You can also use the app via API:
> By replacing 'app-...' with your app url, the examples for the deployment and prediction are: 
> 
> curl -H "Accept: application/json" -H "Content-type: application/json" -X POST -d '{"model_dir":"j-hartmann/emotion-english-distilroberta-base:main", "label":"anger|disgust|fear|joy|neutral|sadness|surprise"}' "http://app-...:8080/deploy"
> 
> curl -H "Accept: application/json" -H "Content-type: application/json" -X POST -d '{"inputs":["Good Movie, best of the year", "Highly recommended","very bad", "worst movie"]}' "http://app-...:8080/predict"
