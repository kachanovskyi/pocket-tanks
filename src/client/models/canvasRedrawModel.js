const polygon = (array, color, backCtx) => {
    backCtx.beginPath();

    array.forEach((pair, number) => {
        if(number == 0) {
            backCtx.moveTo(pair[0], pair[1]);
        } else {
            backCtx.lineTo(pair[0], pair[1]);
        }
    });
    backCtx.fillStyle = color;
    backCtx.fill();
    backCtx.closePath();
};

export function drawGround(originalPoints, backCtx) {
    polygon(originalPoints, '#FFC057', backCtx);
}

export function drawSky(backCtx){
    let grd = backCtx.createLinearGradient(0, 0, 0, 500);
    grd.addColorStop(0, "#172059");
    grd.addColorStop(0.3, "#6D6D85");
    grd.addColorStop(1, "#A0837D");

    backCtx.fillStyle = grd;
    backCtx.fillRect(0, 0, 800, 500);
}