var useLinter = true;
var gl = null;
var canvas = null;
var program = null;
var program2 = null;
var program3 = null;
var simpleProgram = null;
var objectMesh = null;
var programs = [];


var axisVertexShaderSource;
var uniformLightVertexShaderSource;
var axisFragmentShaderSource;
var uniformLightFragmentShaderSource;
var pointLightVertexShaderSource;
var pointLightFragmentShaderSource;
var simpleVertexShaderSource;
var simpleFragmentShaderSource;

var vertexShader;
var vertexShader_2;
var fragmentShader;
var fancyFragmentShader;

var viewMatrix;
var projectionMatrix;

var brickStr;
var cloudStr;
var cylinderStr;
var hedgeStr;
var mountainStr;
var rockStr;
var squareStr;
var treeStr;
var ghostStr;

var objectStrings = [];

var focusedObjectName = 'world';

var renderer;
var inputElementsManager;

var lookRadius = 100;
var elevation = -15.0;
var angle = 0.0;
var cx = 100.0;
var cy = 100.0;
var cz = 100.0;
var mouseState = false;
var lastMouseX = -100, lastMouseY = -100;

var sliderValuex = 1;

var sliderValuey = 1;

var sliderValuez = 1;
var sliderScale = 1;

var nearPlane = 1;
var farPlane = 1000;
var cameraWindowWidth = 50;
var cameraElevation = 0;
var cameraAngle = 0;
var projectionType = "perspective";
var worldAnglex = 0;
var worldAngley = 0;
var worldAnglez = 0;


var wheelSensitivity = 1;

var toggleCreate = 'none';

var cameraType = 'lookAt1'

var fov = 45;

var lookAtX = 0;
var lookAtY = 0;
var lookAtZ = 0;

var pressedKeys = [];

var color = [52/256, 232/256, 235/256, 1.0];
var light = m4.normalize([0.5, 0.7, 1]);

var play_state = false;

var spriteOrientation = 0;
var pointLightPosition = [20,0,0];
var spotlightPosition = [20,20,20];
var spotlightInnerLimit = 0.9;
var spotlightOuterLimit = 0.8;
var spotlightDirection = [0,-1,0];
var lightElevation = -45;
var lightAngle = -45;
var ext;

var uniformLightColor = [1,1,1];
var pointLightColor = [1,1,1];
var spotlightColor = [1,1,1];

function debug(args){
    for(let i=0; i<args.length; i++){
        console.log('debug', i, args[i])
    }
}