// app.js
const AIService = require("./AIService");
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

global.rl = rl;

function ask() {
  rl.question('Please enter some input: ', async(input) => {
    await ProcessRequest(input);
    ask();
  });
}

ask();

async function ProcessRequest(input){

  console.log("Building project...");

 
  var projectName = await AIService.callGPT(input, "estimateProjectName");
  projectName = projectName.output.trim();
  console.log("project name: " + projectName);

  var description = await AIService.callGPT(input, "estimateProjectDescription");
  description = description.output.trim();
  console.log("project description: " + description);

  var tools = await AIService.callGPT(input, "estimateProjectTools");
  tools = tools.output.trim();
  console.log("project tools: " + tools);

  var files = await AIService.callGPT(input, "buildStructure", tools);
  files = files.output.trim();

  var filtered_files = [];

  var fileNames = files.split(";");
  for(var file in fileNames){
    if(fileNames[file].indexOf(".") != -1){
      filtered_files.push(fileNames[file].trim())
      //createFile(projectName + "/" + fileNames[file], "");
      console.log("found file: " + fileNames[file]);
    }
  }

  var data = {name:projectName, description:description, files:filtered_files.join(";"), tools:tools};

  var architecture = await AIService.callGPT("___", "architecture", data);
  architecture = architecture.output.trim();
  data.architecture = architecture;
  console.log("architecture: " + architecture);
  createFile(projectName + "/architecture.txt", architecture);

  var run_instructions = await AIService.callGPT("__", "run_instructions", data);
  run_instructions = run_instructions.output.trim();
  data.run_instructions = run_instructions;
  console.log("run_instructions: " + run_instructions);

  console.log("Done!");

  console.log("Building files...");

  var fileNames = filtered_files;
  for(var file in fileNames){
    console.log("file: " + fileNames[file] + " ("+ file + "/" +fileNames.length + ")");

    var content = await AIService.callGPT(fileNames[file], "buildFile", data);
    content = content.output;
    createFile(projectName + "/" + fileNames[file], content);
    
    console.log("ok: " + fileNames[file]);
  }

  var content = await AIService.callGPT("README.md", "buildReadMeFile", data);
  content = content.output;
  createFile(projectName + "/README.md", content);
  console.log("Done!");
}

const fs = require('fs');
const path = require('path');

function createFile(filePath, contents) {
  filePath = removeLastPeriod(filePath);
  try{
    // Use the 'path' module to create a file path relative to the current working directory
    const fileAbsolutePath = path.join(process.cwd(), filePath);
  
    // Use the 'path' module to extract the directory name from the file path
    const dirname = path.dirname(fileAbsolutePath);
  
    // Use the 'fs' module to create the directories if they do not exist
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }
  
    // Use the 'fs' module to create the file with the given file name and contents
    fs.writeFileSync(fileAbsolutePath, contents);
  }catch(e){
    console.log("failed to save: " + filePath);
  }
}

function removeLastPeriod(str) {
  if (str.endsWith('.')) {
    return str.slice(0, -1);
  } else {
    return str;
  }
}