import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

    @ViewChild('canvas') canvas;

    ctx;
    angleInput = 0;
    mode: string = 'none'
    candidate = { x: 0, y: 0 }
    hours = 0;
    minutes = 0;
    lastMinutesAngle = 0;
    lastHoursAngle = 0;
    canvasCenter = {x: 0, y: 0}
    hourRad;

    @HostListener('mousemove', ['$event'])
    onMousemove(event: MouseEvent) {
        this.updateArrowPosition(event)
    }

    ngAfterViewInit(): void {
        this.canvas = document.getElementById("myCanvas");
        let canvasPos = this.canvas.getBoundingClientRect();
        this.canvasCenter = {
            x: canvasPos.left + canvasPos.width / 2,
            y: canvasPos.top + canvasPos.height / 2,
        }
        this.hourRad = (this.canvas.height / 4);
        this.ctx = this.canvas.getContext("2d");
        this.drawArrow(0);
    }

    formatToStr = (arg) => {
        if (arg < 10) arg = "0" + arg;
        return arg
    }

    clickOnCanvas(event) {
        var imageData: any = this.ctx.getImageData(event.x - 5, event.y, 1, 1);
        var data = imageData.data;
        var color = "rgba(" + data[0] + ", " + data[1] + ", " + data[2] + ", " + (data[3] / 255) + ")";
        if (color === 'rgba(150, 173, 187, 1)') {
            this.mode === 'none' ? this.mode = 'hours' : this.mode = 'none'
        }
        else if (color === 'rgba(89, 167, 218, 1)') {
            this.mode === 'none' ? this.mode = 'minutes' : this.mode = 'none'
        }
        else {
            this.mode != 'none' ? this.mode = 'none' : null;
        }
    }

    // Функция для рисования стрелки и отображения угла
    drawArrow(angle) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.translate(this.canvasCenter.x, this.canvasCenter.y);
        switch (this.mode) {
            case 'none': this.drawHours(); this.drawMinutes(); break;
            case 'minutes': this.ctx.rotate(this.lastHoursAngle); this.drawHours(); this.ctx.rotate(-this.lastHoursAngle); this.ctx.rotate(angle); this.drawMinutes(); break;
            case 'hours': this.ctx.rotate(this.lastMinutesAngle); this.drawMinutes(); this.ctx.rotate(-this.lastMinutesAngle); this.ctx.rotate(angle); this.drawHours(); break;
        }
        this.ctx.restore();
    }

    public get inCircle() {
        let xDiff = this.candidate.x - this.canvasCenter.x;
        let yDiff = this.candidate.y - this.canvasCenter.y;
        let distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
        return distance <= this.hourRad + 20;
    }

    drawHours = () => {
        let realRad = JSON.parse(JSON.stringify(this.hourRad));
        if ((!this.inCircle && this.mode === 'hours') || ((this.mode === 'none' || this.mode === 'minutes') && this.hours > 11)) { realRad = 140 }
        this.ctx.beginPath();
        this.ctx.moveTo(-15, -3);
        this.ctx.lineTo(0, -3);
        this.ctx.lineTo(realRad, -3);
        this.ctx.lineTo(realRad, 3);
        this.ctx.lineTo(0, 3);
        this.ctx.lineTo(-15, 3);
        this.ctx.closePath();
        let arrowColor: string;
        this.mode === 'hours' ? arrowColor = '#7DC0EB' : arrowColor = '#E0F3FF'
        this.ctx.fillStyle = arrowColor;
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(realRad, 0, 7, 0, Math.PI * 2);
        this.ctx.fillStyle = "rgba(150, 173, 187, 1)";
        this.ctx.fill();
    }

    drawMinutes = () => {
        this.ctx.beginPath();
        this.ctx.moveTo(-20, -2);
        this.ctx.lineTo(0, -2);
        this.ctx.lineTo(200, -2);
        this.ctx.lineTo(200, 2);
        this.ctx.lineTo(0, 2);
        this.ctx.lineTo(-20, 2);
        this.ctx.closePath();
        let arrowColor: string;
        this.mode === 'minutes' ? arrowColor = '#7DC0EB' : arrowColor = '#E0F3FF'
        this.ctx.fillStyle = arrowColor;
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc((this.canvas.height / 2) - 18, 0, 7, 0, Math.PI * 2);
        this.ctx.fillStyle = "rgb(89 167 218)";
        this.ctx.fill();
    }

    // Обновление положения и угла стрелки при перемещении указателя
    updateArrowPosition(event) {
        if (this.mode != 'none') {
            var rect = this.canvas.getBoundingClientRect();
            var mouseX = event.clientX - rect.left;
            var mouseY = event.clientY - rect.top;
            this.candidate = { x: mouseX, y: mouseY }
            var angle = Math.atan2(mouseY - this.canvasCenter.y, mouseX - this.canvasCenter.x);
            this.updateInputAngle(angle);
            this.drawArrow(angle);
        }
    }

    updateInputAngle = (angle: number) => {
        console.log(angle)
        let res = (angle * (180 / Math.PI)).toFixed(0) 
        var angleInDegrees: any = Number(res) - 270;
        if (angleInDegrees < 0) {
            angleInDegrees = 360 - Math.abs(angleInDegrees);
        }
        if (angleInDegrees < 0) {
            angleInDegrees = angleInDegrees + 360
        }
        if (this.mode === 'hours') {
            this.lastHoursAngle = angle;
            this.hours = Math.floor(angleInDegrees * 2 / 60);
            if(!this.inCircle) {
                this.hours = Math.floor(angleInDegrees * 2 / 60) + 12;
            }
        }
        if (this.mode === 'minutes') {
            this.lastMinutesAngle = angle;
            this.minutes = Math.floor(angleInDegrees / 6);
        }
    }

    handleChangeInput(type: string) {
        this.mode = type;
        let angleInDegrees;
        if (this.mode === 'hours') {
            let realHours = JSON.parse(JSON.stringify(this.hours))
            if(this.hours >= 12) {
                realHours -= 12;
            }
            angleInDegrees = realHours * 60 / 2
        }
        if (this.mode === 'minutes') {
            angleInDegrees = this.minutes * 6
        }
        console.log(angleInDegrees)

    }

}
