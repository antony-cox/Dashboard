import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { User } from 'app/models/user';
import { first, throwIfEmpty } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'app/services/authentication.service';
import { Workout } from 'app/models/workout';
import { WorkoutService } from 'app/services/workout.service';
import { Chart, ScatterController, LinearScale, LineElement, PointElement, Filler } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { FtpService } from "app/services/ftp.service";
import { Subscription } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';


@Component({
    selector: 'workoutDetail-cmp',
    moduleId: module.id,
    templateUrl: 'workoutDetail.component.html'
})

export class WorkoutDetailComponent implements OnInit{
    public user : User;
    public workout: Workout;
    public id;

    public canvas : any;
    public ctx;
    public chart;
    public chartColor;
    public ftp;

    subscription: Subscription;
    panelState = false;


    constructor(
        private authService: AuthenticationService,
        private workoutService: WorkoutService,
        private toastr: ToastrService,
        private activatedRoute: ActivatedRoute,
        private ftpService: FtpService,
        private clipboard: Clipboard
    ) {
        Chart.register(ScatterController, LinearScale, LineElement, PointElement, Filler, annotationPlugin);
        this.user = authService.currentUserValue;
        this.id = this.activatedRoute.snapshot.paramMap.get("id");
        this.getWorkout();
    }

    ngOnInit() {
      this.workout = new Workout();
      this.subscription = this.ftpService.currentFtp.subscribe(ftp => {
        this.ftp = ftp;
        if(this.workout.data != undefined) { this.updateChart(); }
      });
    }

    ngOnDestroy() {
      this.subscription.unsubscribe();    
    }

    getWorkout()
    {
      if(this.user.permissions.includes('WORKOUT'))
      {
        this.workoutService.getDetail(this.id)
        .pipe(first())
        .subscribe(workout => {
          this.setWorkout(workout);
          this.workoutChart();
        });
      }
    }

    setWorkout(workout)
    {
      this.workout = workout;
      this.workout.goals = this.workout.description.split('\n\nGoals\n\n')[1];
      this.workout.description = this.workout.description.split('\n\nGoals\n\n')[0];
      this.workout.description = this.workout.description.replace('How To\n\n', '');
      this.workout.description = this.workout.description.replace('Description\n\n', '');
    }

    updateChart()
    {
      let chartData = [];

      this.workout.data.forEach(d => {
        chartData.push({x: d.startTime/60, y: (d.startPower/100) * this.ftp });
        chartData.push({x: d.endTime/60, y: (d.endPower/100) * this.ftp });
      })

      this.chart.data.datasets[0].data = chartData;
      this.chart.options.scales.y.suggestedMax = 1.2 * this.ftp;
      this.chart.options.plugins.annotation.annotations.line1.yMin = this.ftp;
      this.chart.options.plugins.annotation.annotations.line1.yMax = this.ftp;
      this.chart.update();
    }

    workoutChart()
    {
      this.canvas = document.getElementById("chartWorkout");
      this.ctx = this.canvas.getContext("2d");

      let chartData = [];
      let backgroundGradient =  this.ctx.createLinearGradient(0, 0, 0, 600);
      backgroundGradient.addColorStop(0, 'rgba(81,203,206,1)');   
      backgroundGradient.addColorStop(1, 'rgba(9,9,121,1)');

      this.workout.data.forEach(d => {
        chartData.push({x: d.startTime/60, y: (d.startPower/100) * this.ftp });
        chartData.push({x: d.endTime/60, y: (d.endPower/100) * this.ftp });
      })

      this.chart = new Chart(this.ctx, {
        type: 'scatter',
        data: {
          datasets: [{
            label: this.workout.name,
            data: chartData,
            borderColor: 'rgba(9,9,121,1)',
            borderWidth: 2,
            backgroundColor: backgroundGradient,
            pointRadius: 0,
            showLine: true,
            fill: 'origin',
          }]
        },
        options: {
          scales: {
            x: {
              type: "linear",
              max: chartData[chartData.length - 1].x
            },
            y: {
              min: 0,
              suggestedMax: 1.2 * this.ftp
            }
          },
          plugins: {
            tooltip: {
              mode: 'index',
              intersect: false
            },
            annotation: {
              annotations: {
                line1: {
                  type: 'line',
                  yMin: this.ftp,
                  yMax: this.ftp,
                  borderColor: 'rgb(255, 99, 132)',
                  borderWidth: 2,
                }
              }
            }
          }
        }
      });
    }

    copyIntervalsData()
    {
      let intervalsData = '';

      this.workout.data.forEach(d => {
        if(intervalsData != '') { intervalsData += '\n' }
        intervalsData += '- ' + (d.endTime - d.startTime) + 's ' + (d.startPower == d.endPower ? d.startPower + '%' : 'ramp ' + d.startPower + '-' + d.endPower + '%');
      });

      this.clipboard.copy(intervalsData);
      this.showNotification('succes', 'Intervals data copied to clipboard.');
    }

    showNotification(style, message)
    {
      this.toastr.info(
        '<span data-notify="icon" class="nc-icon nc-bell-55"></span><span data-notify="message">' + message + '</span>',
          "",
          {
            timeOut: 4000,
            closeButton: true,
            enableHtml: true,
            toastClass: "alert alert-" + style + " alert-with-icon",
            positionClass: "toast-top-right"
          }
        );   
    }
}

