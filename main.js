// function main() {

// 	var canvas = document.getElementById("canvas");
//     var gl = canvas.getContext("webgl2");
// 	if(!gl) {
// 		document.write("GL context not opened");
// 		return;
// 	}
//     aspectRatio = canvas.clientWidth/canvas.clientHeight;

// }
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
context.fillStyle = "#FF0000";
context.fillRect(0,0,150,75);