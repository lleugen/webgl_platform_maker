var useLinter = true;
var ext;

// variables related to graphics rendering #####################################################################
var renderer;
var gl = null;
var canvas = null;
var program = null;
var program2 = null;
var program3 = null;
var skyboxProgram = null;
var simpleProgram = null;
var programs = [];

var objectMesh = null;
var brickStr;
var cloudStr;
var cylinderStr;
var hedgeStr;
var mountainStr;
var rockStr;
var squareStr;
var treeStr;
var ghostStr;
var modelNames = ['brick', 'cloud', 'cylinder', 'hedge', 'mountain', 'rock', 'square', 'tree']
var objectStrings = [];

var axisVertexShaderSource;
var uniformLightVertexShaderSource;
var axisFragmentShaderSource;
var uniformLightFragmentShaderSource;
var pointLightVertexShaderSource;
var pointLightFragmentShaderSource;
var simpleVertexShaderSource;
var simpleFragmentShaderSource;
var skyboxVertexShaderSource;
var skyboxFragmentShaderSource;
var vertexShader;
var vertexShader_2;
var fragmentShader;
var fancyFragmentShader;

// var elevation = -15.0;
// var angle = 0.0;
// var cx = 100.0;
// var cy = 100.0;
// var cz = 100.0;

var pointLightPosition = [20,0,0];
var spotlightPosition = [20,20,20];
var spotlightInnerLimit = 0.9;
var spotlightOuterLimit = 0.8;
var spotlightDirection = [0,-1,0];
var lightElevation = -45;
var lightAngle = -45;
var uniformLightColor = [1,1,1];
var pointLightColor = [1,1,1];
var spotlightColor = [1,1,1];
var uniformLightPosition = [-50,30,30];
var uniformLightPositionMoving;
var secondaryUniformLightPosition = [50,30, -25];
var secondaryUniformLightPositionMoving;
var color = [52/256, 232/256, 235/256, 1.0];
var light = m4.normalize(uniformLightPosition);
var u_roughness = 0.5;
var depthTexture;
var depthTexture2;
var depthTexture3;
var depthTextureSize;
var depthFramebuffer;
var depthFramebuffer2;
var depthFramebuffer3;
var depthTextureIndex = 0;
var objectTextureIndex = 1;
var cubeTextureIndex = 2;
var depthTextureIndex2 = 3;
var depthTextureIndex3 = 4;
var cubeTexture;
var lightFov = 45;
var u_bias = -0.01;
var lineVao;
var u_decay = 2.0;
var u_spotlightPower = 10;

var lines;
var lineBuffer;

// variables related to the camera #####################################################################
var viewMatrix;
var projectionMatrix;
var cameraParameters = {
    'x': 20,
    'y': 20,
    'z': 20,
    'elevation': -45,
    'angle': -45,
    'radius': 50,
    'sensitivity': 0.2
}
var nearPlane = 1;
var farPlane = 1000;
var cameraWindowWidth = 50;
var cameraElevation = 0;
var cameraAngle = 0;
var projectionType = "perspective";
var worldAnglex = 0;
var worldAngley = 0;
var worldAnglez = 0;
var cameraType = 'lookAt1'
var fov = 45;
var lookAtX = 0;
var lookAtY = 0;
var lookAtZ = 0;

// variables related to the game world #####################################################################
var play_state = false;

var worldSettings = {
    'gForce': 10,
    'jumpPower': 2,
    'collectibleProbability': 0.3,
    'randomOrientation': false,
    'randomScale': false,
    'gameAreaSize': 600,
    'decorationRadius': 0.7
}
var defaultSizes = {
    'tree': 5,
    'hedge': 5,
    'rock': 5,
    'brick': 5,
    'cloud': 5,
    'cylinder': 40,
    'mountain': 5,
    'square': 30,
    'sphere': 1,
    'triangle': 1,
    'ghost': 5
}
var loreItems = [
    "wait it's all triangles, always has been",
    "gl in webgl stands for good luck because you're going to need it",
    "remember to transpose the uniform matrix",
    "i don't need math i'll make video games",
    "should we implment the ui in webgl?",
    "3, the number of new geometrical entities that have been invented in the development of this game",
    "this application requires trichromatic vision to read correctly",
    "one does not simply 'debug' a shader ",
    "vantablack rock: this is a feature, not a bug",
    "compilation and runtime warnings and errors: gotta catch them all",
    "this matrix multiplication smells wrong",
    "back in the old days there was only one space and three dimensions",
    "remember to enable your attributes",
    "if an attribute is never used, then it will not be assigned a location"
]
var savedGames = {
    1: {},
    2: {},
    3: {}
}

// margin for comparing floating point numbers #####################################################################
var FP_margin = 0.01

// variables related to the UI on the HTML page #####################################################################
var inputElementsManager;
var debugButtons = false;
var sliderValuex = 1;
var sliderValuey = 1;
var sliderValuez = 1;
var sliderScale = 1;
var wheelSensitivity = 1;
var toggleCreate = 'none';

// variables related to game UI #####################################################################
var spriteOrientation = 0;
var focusedObjectName = 'world';
var mouseState = false;
var lastMouseX = -100, lastMouseY = -100;
var pressedKeys = [];

// debug function #####################################################################
function debug(args){
    for(let i=0; i<args.length; i++){
        console.log('debug', i, args[i])
    }
}
