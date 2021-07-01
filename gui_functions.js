var sliderValuex = 1;
function onSliderChangex(value){
    console.log("Slider value changed to "+value);
    sliderValuex = value;
    renderer.updateObject(focusedObjectName);
}
var sliderValuey = 1;
function onSliderChangey(value){
    console.log("Slider value changed to "+value);
    sliderValuey = value;
    renderer.updateObject(focusedObjectName);
}
var sliderValuez = 1;
function onSliderChangez(value){
    console.log("Slider value changed to "+value);
    sliderValuez = value;
    renderer.updateObject(focusedObjectName);
}
var nearPlane = 1;
function onSliderChangeNear(value){
    console.log("Slider value changed to "+value);
    nearPlane = parseFloat(value);
}
var farPlane = 300;
function onSliderChangeFar(value){
    console.log("Slider value changed to "+value);
    farPlane = parseFloat(value);
}
var cameraWindowWidth = 10;
function onSliderChangew(value){
    console.log("Slider value changed to "+value);
    cameraWindowWidth = value;
}
var cameraElevation = 0;
function onSliderChangeElevation(value){
    console.log("Slider value changed to "+value);
    cameraElevation = value;
}
var cameraAngle = 0;
function onSliderChangeAngle(value){
    console.log("Slider value changed to "+value);
    cameraAngle = value;
}

var projectionType = "perspective";
function onRadioButtonChange(value){
  console.log("Radio button value changed to "+value);
  projectionType = value;
}

var worldAnglex = 0;
function onSliderChangeWorldAnglex(value){
    console.log("Slider value changed to "+value);
    worldAnglex = value;
}
var worldAngley = 0;
function onSliderChangeWorldAngley(value){
    console.log("Slider value changed to "+value);
    worldAngley = value;
}
var worldAnglez = 0;
function onSliderChangeWorldAnglez(value){
    console.log("Slider value changed to "+value);
    worldAnglez = value;
}