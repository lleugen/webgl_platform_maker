var gl = null;
var canvas = null;
var program = null;
var program2 = null;
var objectMesh = null;

var vertexShaderSource;
var vertexShaderSource_2;
var fragmentShaderSource;
var fancyFragmentShaderSource;

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

var objectStrings = [];

var focusedObjectName = 'world';

var renderer;

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

var nearPlane = 1;
var farPlane = 300;
var cameraWindowWidth = 10;
var cameraElevation = 0;
var cameraAngle = 0;
var projectionType = "perspective";
var worldAnglex = 0;
var worldAngley = 0;
var worldAnglez = 0;