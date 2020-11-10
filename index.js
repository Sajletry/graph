document.addEventListener("DOMContentLoaded", init);

function init () {
    const canvasX = 400;
    const canvasY = 400;
    let canvas = document.getElementById('canvas');
    let canvasResult = document.getElementById('canvasResult');
    let depth = document.getElementById('depth');
    let maxValInput = document.getElementById('maxVal');
    let startButton = document.getElementById('start');
    let file = document.getElementById('file');
    let resultInput = document.getElementById('result');
    let context = canvas.getContext('2d');
    context.mozImageSmoothingEnabled = false;
    context.webkitImageSmoothingEnabled = false;
    context.imageSmoothingEnabled = false;
    let contextResult = canvasResult.getContext('2d');
    contextResult.mozImageSmoothingEnabled = false;
    contextResult.webkitImageSmoothingEnabled = false;
    contextResult.imageSmoothingEnabled = false;
    let depth0;
    let val0;
    let maxDepth;
    let maxVal;
    let stepSize;
    let valSize;
    let result = [];
    let resultArrs=[]
    startButton.addEventListener('click', () => {
        getDepthLine();
        getZeroLine();
        getLastValue();
        getMaxValue();
        drawDepthLine();
        drawZeroLine();
        getNormalization();
        analise();
        // drawResult();
        postResult();
        drawIntegrated();
    })

    function drawIntegrated(){
        context.strokeStyle = "#00FF00";
        context.lineWidth = 2;
        context.moveTo( depth0,val0);
        resultArrs.forEach((value,index)=>{
            const integrVal = value.val/value.count;
            console.log(value)
            context.lineTo(depth0+index*stepSize, val0-integrVal*valSize);

        })
        context.stroke();
    }

    function postResult(){
        let resultText ='x;y;\n';
        result.forEach(((value, index) => {
            if(!resultArrs[Math.round(index/stepSize)]){
                resultArrs[Math.round(index/stepSize)] = {count:0,val:0};
            }
            resultArrs[Math.round(index/stepSize)].count++;
            resultArrs[Math.round(index/stepSize)].val+=parseInt(maxValInput.value)-Math.round((value-maxVal)/valSize);
        }))
        resultArrs.forEach(((value, index) => {
            resultText+=`${index};${(value.val/value.count).toFixed(2)};\n`
        }))
        resultInput.value = resultText;
    }

    file.addEventListener('change', () => {
        let fReader = new FileReader();
        fReader.readAsDataURL(file.files[0]);
        fReader.onloadend = function (event) {
            let img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                context.drawImage(img, 0, 0)
            };
        }
    })

    function analise(){
        for(let i=depth0+1;i<=maxDepth; i++){
            let val = val0;
            for(let j=maxVal; j<=val0; j++){
                const colors = context.getImageData(i, j, 1, 1).data;
                if ((colors[0] === 255 && colors[1] !== 255 && colors[2] !== 255) ||
                    (colors[0]===0 && colors[1]!=0)) {
                    val=j;
                    break;
                }
            }
            result.push(val);
        }
        console.log(result)
    }

    function drawResult(){
        contextResult.strokeStyle = "#ff0000";
        context.lineWidth = 0.1;
        result.forEach((value,index)=>{
            contextResult.moveTo(index, val0);
            contextResult.lineTo(index, value);

        })
        contextResult.stroke();
    }

    function drawDepthLine () {
        context.strokeStyle = "#00ff00"
        context.lineWidth = 1;
        // context.moveTo(depth0, 0);
        // context.lineTo(depth0, canvasY);
        // context.moveTo(maxDepth, 0);
        // context.lineTo(maxDepth, canvasY);
        context.stroke();
    }

    function drawZeroLine () {
        context.strokeStyle = "#00ff00"
        context.lineWidth = 1;
        // context.moveTo(0, val0);
        // context.lineTo(canvasX, val0);
        // context.moveTo(0, maxVal);
        // context.lineTo(canvasX, maxVal);
        context.stroke();
    }

    function getNormalization () {
        valSize = (val0 - maxVal) / parseInt(maxValInput.value);
        stepSize = (maxDepth - depth0) / parseInt(depth.value);
    }

    function getLastValue () {
        for (let i = 0; i < canvasY; i++) {
            const colors = context.getImageData(depth0, i, 1, 1).data;
            if (colors[1] != 255 && colors[0] !== 0 && colors[1] !== 0) {
                maxVal = i;
                break;
            }
        }
    }

    function getMaxValue () {
        for (let i = canvasX; i > 0; i--) {
            const colors = context.getImageData(i, val0 - 2, 1, 1).data;
            if (colors[1] != 255 && colors[0] !== 0 && colors[1] !== 0) {
                maxDepth = i + 1;
                break;
            }
        }
    }


    function getDepthLine () {
        for (let i = 0; i < canvasX; i++) {
            let isColorExist = true;
            const colors = context.getImageData(i, canvasY / 2, 1, 1).data;
            if (colors[0] === colors[1] && colors[0] === colors[2] && colors[0] < 240) {
                const color = colors[0];
                for (let j = 0; j < 10; j++) {
                    const colors = context.getImageData(i, canvasY / 2 + j, 1, 1).data;
                    if (color === colors[1] && color === colors[2] && color === colors[0]) {

                    } else {
                        isColorExist = false;
                    }
                }
                if (isColorExist) {
                    depth0 = i;
                    break;
                }
            } else {
                isColorExist = false;
            }
        }
    }

    function getZeroLine () {
        for (let i = canvasY; i > 0; i--) {
            let isColorExist = true;
            const colors = context.getImageData(canvasX / 2, i, 1, 1).data;
            if (colors[0] === colors[1] && colors[0] === colors[2] && colors[0] < 240) {
                const color = colors[0];
                for (let j = 0; j < 10; j++) {
                    const colors = context.getImageData(canvasX / 2 + j, i, 1, 1).data;
                    if (colors[0] !== 255 && colors[0] !== 0 && colors[1] !== 255 && colors[1] !== 0) {

                    } else {
                        isColorExist = false;
                    }
                }
                if (isColorExist) {
                    val0 = i;
                    break;
                }
            } else {
                isColorExist = false;
            }
        }
    }
}
