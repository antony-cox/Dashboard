import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { User } from 'app/models/user';
import { first, throwIfEmpty } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'app/services/authentication.service';
import { Workout } from 'app/models/workout';
import { WorkoutService } from 'app/services/workout.service';
import Chart from 'chart.js';
import { formatDate } from '@angular/common';

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

    constructor(
        private authService: AuthenticationService,
        private workoutService: WorkoutService,
        private toastr: ToastrService,
        private activatedRoute: ActivatedRoute
    ) {
        this.user = authService.currentUserValue;
        this.id = this.activatedRoute.snapshot.paramMap.get("id");
        this.getWorkout();
    }

    ngOnInit() {
      this.workout = new Workout();
    }

    getWorkout()
    {
      if(this.user.permissions.includes('WORKOUT'))
      {
        this.workoutService.getDetail(this.id)
        .pipe(first())
        .subscribe(workout => {
          this.workout = workout;
          this.workout.goals = this.workout.description.split('Goals\n\n')[1];
          this.workout.description = this.workout.description.split('Goals\n\n')[0];
          this.workout.description = this.workout.description.replace('How To\n\n', '');
          this.workout.description = this.workout.description.replace('Description\n\n', '');
          this.workoutChart();
        });
      }
    }

    workoutChart()
    {
      this.chartColor = "#FFFFFF";

      this.canvas = document.getElementById("chartWorkout");
      this.ctx = this.canvas.getContext("2d");

      let chartData = [];
      
      this.workout.data.forEach(d => {
        chartData.push({x: d.startTime/60, y: d.startPower});
        chartData.push({x: d.endTime/60, y: d.endPower});
      })

      console.log(chartData);

      this.chart = new Chart(this.ctx, {
        type: 'scatter',

        data: {
          datasets: [{
              label: this.workout.name,
              data: chartData,
              showLine: true,
              lineTension: 0,
              borderColor: '#007bff',
              backgroundColor: '#5eacff',
              radius: 0
            }
          ]
        },
        options: {
          legend: {
            display: false
          },

          tooltips: {
            enabled: true,
            mode: 'nearest',
            intersect: false
          },

          hover: {
            mode: 'nearest',
            intersect: false
          },

          scales: {
            yAxes: [{
              ticks: {
                fontColor: "#9f9f9f",
                beginAtZero: true,
                maxTicksLimit: 5,
                //padding: 20
              },
              gridLines: {
                drawBorder: true,
                color: 'rgba(0,0,0,0.1)',
                zeroLineColor: "rgba(0,0,0,0.4)",
                display: true
              }
            }],

            xAxes: [{
              barPercentage: 1.6,
              gridLines: {
                drawBorder: true,
                color: 'rgba(0,0,0,0.1)',
                zeroLineColor: "rgba(0,0,0,0.4)",
                display: true
              },
              ticks: {
                padding: 20,
                fontColor: "#9f9f9f"
              }
            }]
          },
        }
      });
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

