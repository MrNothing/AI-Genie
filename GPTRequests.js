const fs = require('fs');
const https = require("https");

// Read the JSON file
const jsonString = fs.readFileSync('config.json', 'utf-8');

// Parse the JSON string into an object
const config = JSON.parse(jsonString);

// Access the "OpenAI_API_Key" property
const API_KEY = config.OpenAI_API_Key;

const sendRequest = (prompt, callback, model, max_tokens, temperature) => {
  if(model==undefined)
    model = "gpt-4";
  if(max_tokens==undefined)
    max_tokens = 1000;
  if(temperature==undefined)
    temperature = 0;

  // Set up the request URL and HTTP headers
  const requestUrl = "https://api.openai.com/v1/chat/completions";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
  };
  
  // Set up the request data
  const data = {
    model: model,
    messages: [{role: "user", content: prompt}]
    //prompt: prompt,
    //temperature: temperature,
    //max_tokens: max_tokens,
  };

  // Send the request and get the response
  sendHttpPostRequest(requestUrl, headers, data, (response) => {
    callback(response);
  });
};

// This function sends an HTTP POST request
const sendHttpPostRequest = (url, headers, data, callback) => {
  const options = {
    method: "POST",
    headers,
  };

  const req = https.request(url, options, (res) => {
    let responseString = "";

    res.on("data", (data) => {
      responseString += data;
    });

    res.on("end", () => {
      callback(JSON.parse(responseString));
    });
  });

  req.write(JSON.stringify(data));
  req.end();
};

// Export the sendRequest function
module.exports = {
  sendRequest,
};