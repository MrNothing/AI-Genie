const HISTORY_LIMIT = 1000;
const HISTORY_LINE_LIMIT = 250;

const GPTRequests = require("./GPTRequests");
const readline = require('readline');
  
function get_current_date(){
    const date = new Date();
    return date;
}

var contexts = {};
function buildProjectStructureContext(prompt, language)
{
    var context = "You will be given a project idea. Based on the idea, suggest a project structure include files and folders."
    context += "\nSparate the files with a ';' character.";
    context += "\nThis is an example Project structure for c#: Program.cs;Utils/Math.cs;Model/Player.cs";
    context += "\nThis is an example Project structure for js: app.js;Utils/Math.js";
    context += "\nIn this case, you will use the " + language + " language.";
    context += "\nAlways prefer an elegant architecture, suggest as little files as possible, organize things to be as clear and simple as possible. Every file must not contain more that 150 LOC.";
    context += "\n\nIdea: " + prompt;
    context += "\n\nFiles:";

    console.log("struct context: " + context);

    return context;
}
contexts["buildStructure"] = buildProjectStructureContext;

function estimateProjectName(prompt){

    var context = "You will be given a project idea. Based on the idea, suggest a short project name."
    context += "\nIdea: " + prompt;
    context += "\n\nProject name:";

    return context;
}
contexts["estimateProjectName"] = estimateProjectName;

function buildFile(file, data){
    const os = require('os');

    // Get the operating system name
    const osName = os.type();

    var context = "\nproject name: " + data.name;
    context += "\nproject description: " + data.description;
    context +=  "\nOs: " + osName;
    context += "\nThis is the project structure:";
    context += "\n<files>"+data.files+"</files>";
    context += "\n<uml>"+data.architecture+"</uml>";
    context += "\n<instuctions>"+data.run_instructions+"</instuctions>";
    context += "\nImplement the file: " + file +". Do not assume there are any image/sound/models assets avaliable. Do not use functions from other files it they are not in the uml diagram. Only aswer with code, if you have something you want to say, put it in comments.\ncontent:";
    
    return context;
}
contexts["buildFile"] = buildFile;

function buildReadMeFile(file, data){
    var context = "\nproject name: " + data.name;
    context += "\nproject description: " + data.description;
    context += "\nproject tools: " + data.description;
    context += "\nThis is the project structure:";
    context += "\n<files>"+data.files+"</files>";
    context += "\n<uml>"+data.architecture+"</uml>";
    context += "\n<instuctions>"+data.run_instructions+"</instuctions>";
    context += "README.md content:";
    
    return context;
}
contexts["buildReadMeFile"] = buildReadMeFile;

function estimateProjectDescription(prompt){

    var context = "You will be given a project idea. Based on the idea, suggest a project description."
    context += "\nIdea: " + prompt;
    context += "\n\nProject description:";

    return context;
}
contexts["estimateProjectDescription"] = estimateProjectDescription;

function estimateProjectTools(prompt){

    var context = "You will be given a project idea. Based on the idea you must choose a laguage and a tool. Only anwer with the language and the tool."
    context += "\nIdea: " + prompt;
    context += "\n\nlanguage and tool:";

    return context;
}
contexts["estimateProjectTools"] = estimateProjectTools;

function buildArchitecture(_, data){
    var context = "\nproject name: " + data.name;
    context += "\nproject description: " + data.description;
    context += "\nproject tools: " + data.tools;
    context += "\nThis is the project structure:";
    context += "\n<files>"+data.files+"</files>";
    context += "Suggest a class diagram for this project, the diagram must include the public functions and their arguments. Shared objects (such as scene/html object ids etc...) must be included:";
    
    return context;
}
contexts["architecture"] = buildArchitecture;

function run_instructions(_, data){
    var context = "\nproject name: " + data.name;
    context += "\nproject description: " + data.description;
    context += "\nproject tools: " + data.tools;
    context += "\nThis is the project structure:";
    context += "\n<files>"+data.files+"</files>";
    context += "\n<uml>"+data.architecture+"</uml>";
    context += "Describe how the game runs, if it has an entry point or a main loop:";
    
    return context;
}
contexts["run_instructions"] = run_instructions;

function callGPT(prompt, context, extra_params, debug){
    return new Promise(resolve => {
        /*
        var final_prompt = contexts[context](prompt, extra_params);
        console.log("prompt: " + final_prompt);
        global.rl.question('input: ', async(input) => {
            resolve({output:input});
          });
        */
    
    //make sure prompt is not empty
    if(prompt.replace(/\r\n/, "").length>1){
        var final_prompt = contexts[context](prompt, extra_params);
        if(debug)
            console.log("final_prompt: " + final_prompt);

        GPTRequests.sendRequest(final_prompt, (response) => {
            //if(debug)
                console.log("response: " + JSON.stringify(response));
            
            if(response.choices!=undefined && response.choices.length>0){
                resolve({output:response.choices[0].message.content});
            }
            else{
                console.log(response);
                resolve({response});
            }
        });
    }
    else{
        resolve({"error":{"message":"empty prompt"}});
    }

    });
}

function getURLContents(url){
    return new Promise(resolve => {
        var request = require('request');
        request(url, { json: true }, (err, res, body) => {
            if (err) { return console.log(err); }
            resolve(body);
        });
    });
}

// Export the sendRequest function
module.exports = {
    callGPT, getURLContents
};